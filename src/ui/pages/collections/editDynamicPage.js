/*
* @Author: philipp
* @Date:   2017-08-02 16:06:03
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 12:31:07
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import { TMPL_COLL, TMPL_SCHEMA, TMPL_VAR } from '/imports/core/api/collections/collections.js';

import '/imports/core/ui/components/mediaManagerModal/mediaManagerModal.js';
import '/imports/core/ui/layouts/basic/basic.js';

import './editDynamicPage.html';

const TMPL_NAME = 'editDynamicPage';

Template[TMPL_NAME].onCreated(function() {
	const that = this;

	const lang = FlowRouter.current().params._lang || 'de';
	that.selectedLanguage = new ReactiveVar(lang);

	that.subscribe('all-'+TMPL_VAR);
});

Template[TMPL_NAME].onRendered(function() {
	AutoForm.resetForm('updateProject');
});

Template[TMPL_NAME].helpers({
	doc() {
		const tmpl = Template.instance()
		,	lang = tmpl.selectedLanguage.get()
		,	id = FlowRouter.current().params._id;

		return TMPL_COLL.findOne({_id: id});
	},
	collSchema() {
		return TMPL_SCHEMA;
	},
	isSelectedLang(lang) {
		const tmpl = Template.instance()
		,	selected = tmpl.selectedLanguage.get();
		return (lang==selected);
	},
	baseUrl() {
		return Meteor.settings.public.url;
	},
	urlLang() {
		const tmpl = Template.instance();
		return (tmpl.selectedLanguage.get()=='en')?'en/':'';
	},
	tmplVar() {
		return TMPL_VAR;
	},
	meteormethod() {
		return TMPL_VAR+'.update';
	},
	getMainLanguageValue(key) {
		const mainLang = Meteor.settings.public.availableLanguages[0];
		return this[mainLang] && this[mainLang][key];
	}
});

Template[TMPL_NAME].events({
	// 'click [data-action="change-lang"]'(ev,tmpl) {
	// 	const lang = $(ev.target).data('lang')
	// 	,	id = FlowRouter.current().params._id
	// 	,	currentProject = TMPL_COLL.findOne({_id: id})
	// 	,	newProject = TMPL_COLL.findOne({language: lang, slug: currentProject.slug});
		
	// 	FlowRouter.go('/'+TMPL_VAR+'/'+newProject._id+'/'+lang);

	// 	BlazeLayout.reset();
	// 	BlazeLayout.render('App_body', { main: "editProject" });
	// }
});