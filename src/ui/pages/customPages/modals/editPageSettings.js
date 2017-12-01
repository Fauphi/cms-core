/*
* @Author: philipp
* @Date:   2017-08-10 18:42:28
* @Last Modified by:   philipp
* @Last Modified time: 2017-11-02 13:10:59
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import { Utils } from '/imports/tools/Utils.js';

import { CustomPages } from '/imports/core/api/customPages/customPages.js';

import { typeSchemes, omitFunction } from '/imports/ui/pages/customPages/typeSchemes.js';

import '/imports/core/ui/layouts/basic/basic.js';
import '/imports/core/ui/pages/customPages/createCustomPage.js';

import '/imports/ui/pages/customPages/pageSettings/projectPageSettings.js';

import './editPageSettings.html';

Template.editPageSettings.onCreated(function() {
	const that = this;

	Session.set('activeTab', 'settings');
	// that.activeTab = new ReactiveVar('settings');
	that.isUrlValid = new ReactiveVar(false);
});

Template.editPageSettings.onRendered(function() {
	const that = this;
	$('#editPageSettingsModal').on('closed', (ev,modalId)=>{
		if(modalId=='#editPageSettingsModal') Session.set('activeTab', 'settings');
		// if(modalId=='#editPageSettingsModal') that.activeTab.set('settings');
	});
});

Template.editPageSettings.helpers({
	isActiveTab(tab) {
		const tmpl = Template.instance()
		,	activeTab = Session.get('activeTab');
		// return tmpl && (tmpl.activeTab.get()==tab);
		return tmpl && (activeTab==tab);
	},
	getPage() {
		const pageId = FlowRouter.getParam('_id');
		return pageId && CustomPages.findOne({_id: pageId});
	},
	getPageSchema() {
		return CustomPages.simpleSchema();
	},
	getOmitFields() {
		const tmpl = Template.instance()
		,	pageId = FlowRouter.getParam('_id')
		,	page = CustomPages.findOne({_id: pageId})
		,	omitFields = ['language'];

		if(page) {
			return omitFunction(page, omitFields);
		}
	},
	languageVersions() {
		const pageId = FlowRouter.getParam('_id')
		,	current = CustomPages.findOne({_id: pageId})
		,	versions = (current)?CustomPages.find({languageId: current.languageId}).fetch():[]
		,	labels = Meteor.settings.public.languageLables
		,	langs = [];

		for(let version of versions) {
			langs.push({label: labels[version.language], value: version.language, _id: version._id});
		}

		return langs;
	},
	availableLanguages() {
		const availLangs = Utils.cloneArray(Meteor.settings.public.availableLanguages)
		,	pageId = FlowRouter.getParam('_id')
		,	current = CustomPages.findOne({_id: pageId})
		,	labels = Meteor.settings.public.languageLables
		,	langs = [];

		if(current) {
			for(let i=0;i<availLangs.length;i++) {
				if(CustomPages.findOne({languageId: current.languageId, language: availLangs[i]})) {
					availLangs.splice(i,1);
					i--;
				}
			}

			for(let lang of availLangs) {
				langs.push({label: labels[lang], value: lang});
			}

			return langs;
		}
	},
	baseUrl() {
		return Meteor.settings.public.url;
	},
	isUrlFieldNotEmpty() {
		const tmpl = Template.instance()
		,	$field = tmpl.$('#update-url-input')
		,	isValid = tmpl.isUrlValid.get();
		
		return $field.val() && /\S/.test($field.val());
	},
	isUrlValid() {
		const tmpl = Template.instance();
		return tmpl.isUrlValid.get();
	},
	isType(type) {
		const pageId = FlowRouter.getParam('_id')
		,	current = CustomPages.findOne({_id: pageId});
		return current && (type==current.type);
	}
});

Template.editPageSettings.events({
	'click [data-action="change-tab"]'(ev,tmpl) {
		const $elm = $(ev.target)
		,	tab = $elm.data('tab');
		Session.set('activeTab', tab);
		// tmpl.activeTab.set(tab);
	},
	'click [data-action="open-language-version"]'(ev) {
		ev.preventDefault();
		FlowRouter.go('/custom/'+this._id);
		BlazeLayout.reset();
		BlazeLayout.render('App_body', {main: 'createCustomPage'});
	},
	'click [data-action="create-language-version"]'() {
		const pageId = FlowRouter.getParam('_id');
		
		if(pageId) {
			Meteor.call('customPages.createLanguageVersion', pageId, this.value);
		}
	},
	'click [data-action="delete-language-version"]'() {
		const pageId = FlowRouter.getParam('_id');
		
		if(pageId) {
			Meteor.call('customPages.delete', pageId, ()=>{
				FlowRouter.go('/custom');
				BlazeLayout.reset();
				BlazeLayout.render('App_body', {main: 'core_customPages'});
			});
		}
	},
	'keyup [data-action="validate-url"]'(ev,tmpl) {
		const $elm = $(ev.target)
		,	url = $elm.val();
		Meteor.call('customPages.validateUrl', url, (err, res)=>{
			tmpl.isUrlValid.set(res);
		});
	},
	'click [data-action="update-url"]'(ev,tmpl) {
		ev.preventDefault();
		const pageId = FlowRouter.getParam('_id')
		,	newUrl = tmpl.$('#update-url-input').val();

		Meteor.loader('show', 'Updating URL');

		if(newUrl && /\S/.test(newUrl)) {
			Meteor.call('customPages.updateUrl', pageId, newUrl, ()=>{
				Meteor.loader('hide');
			});
		}
	}
});
