/*
* @Author: philipp
* @Date:   2017-08-31 15:57:31
* @Last Modified by:   philipp
* @Last Modified time: 2017-10-01 12:51:15
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './createCustomPage.html';

const TMPL_NAME = 'core_createCustomPage';

Template[TMPL_NAME].onCreated(function onCreated() {
	const that = this;
	that.formData = new ReactiveVar({});
	that.pageType = new ReactiveVar(null);

	that.autorun(()=>{
		FlowRouter.watchPathChange();
		const queryParams = FlowRouter.current().queryParams;
		if(queryParams.type) {
			that.pageType.set(queryParams.type);
		}
	});
});

Template[TMPL_NAME].onRendered(function onRendered() {
	const that = this;
	$('#core_createCustomPage').on('opened', (ev,modalId)=>{
		if(modalId=='#core_createCustomPage') {
			const type = that.pageType.get();
			if(type) that.formData.set({type: type, languages: []});
			else that.formData.set({type: '', languages: []});

			that.$('input[name="title"]').focus();
		}
	});
});

Template[TMPL_NAME].helpers({
	availableLanguages() {
		const langs = []
		,	labels = Meteor.settings.public.languageLables;
		for(let lang of Meteor.settings.public.availableLanguages) {
			langs.push({label: labels[lang], value: lang});
		}
		return langs;
	},
	customPageTypes() {
		return Meteor.settings.public.customPageTypes;	
	},
	isActive(schemaKey) {
		const tmpl = Template.instance()
		,	formData = tmpl.formData.get();
		if(schemaKey=='type') return formData && (formData[schemaKey]==this.value);
		else return formData && formData[schemaKey] && (formData[schemaKey].indexOf(this.value)>-1);
	},
	hasPageType() {
		const tmpl = Template.instance()
		,	type = tmpl.pageType.get();
		return !!type;
	},
	mainTitle() {
		const tmpl = Template.instance()
		,	type = tmpl.pageType.get()
		,	availTypes = Meteor.settings.public.customPageTypes;
		let	label = 'Custom Page';

		for(let t of availTypes) {
			if(t.value==type) {
				label = t.label;
				break;
			}
		}

		return label;
	}
});

Template[TMPL_NAME].events({
	'click [data-action="change-data"]'(ev,tmpl) {
		const $btn = $(ev.target)
		,	key = $btn.data('schemaKey')
		,	value = $btn.data('value')
		,	formData = tmpl.formData.get();

		if(key=='type') {
			formData[key] = value;
		} else {
			if(!formData[key]) formData[key] = [];

			if(formData[key].indexOf(value)>-1) formData[key].splice(formData[key].indexOf(value), 1);
			else formData[key].push(value);
		}

		tmpl.formData.set(formData);
	},
	'click [data-action="create-custom-page"]'(ev,tmpl) {
		const $inputs = tmpl.$('.form').find('input, select')
		,	formData = tmpl.formData.get();

		$.each($inputs, function() {
			const $that = $(this)
			,	key = $that.attr('data-schema-key');
			if($that.attr('type')=='checkbox') {
				if(!formData[key]) formData[key] = [];
				if($that[0].checked) formData[key].push($that.data('value'));
			} else formData[key] = $that.val();
		});

		let valid = true;

		for(let key in formData) {
			if(!formData[key] || formData[key].length==0 || !/\S/.test(formData[key])) {
				valid = false;
			}
		}

		if(valid) {
			const $btn = $(ev.target);
			
			Meteor.loader('show', 'Creating new page');
			Meteor.call('customPages.create', formData, (err,res)=>{
				if(res) FlowRouter.go('/custom/'+res);
				Meteor.loader('hide');
				Meteor.modal('#core_createCustomPage', 'hide');
			});
		} else {
			alert('Something is missing.');
		}
	}
});