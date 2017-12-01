/*
* @Author: philipp
* @Date:   2017-08-08 17:14:37
* @Last Modified by:   philipp
* @Last Modified time: 2017-11-01 13:16:18
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Collections } from '/imports/core/api/collectionPages/collectionPages.js';

import { CleanString } from '/imports/tools/CleanString.js';
import { CollectionTools } from '/imports/tools/CollectionTools.js';

import './createDoc.html';

const TMPL_NAME = 'sys_createDocModal';

Template[TMPL_NAME].onCreated(function() {
	const that = this;

	that.schema = new ReactiveVar(null);
	that.tmplVar = new ReactiveVar(null);

	that.autorun(()=>{
		FlowRouter.watchPathChange();
		
		that.subscribe('all-collections', ()=>{
			const params = FlowRouter.current().params
			,	page = Collections.findOne({tmplVar: params._tmplVar});

		    const schema = CollectionTools.parseSchema(page.baseSchema, page.langSchema, Meteor.settings.public.availableLanguages);

			that.schema.set(new SimpleSchema(schema));
			that.tmplVar.set(page.tmplVar);

			that.subscribe('all-'+page.tmplVar);
		});
	});
});

Template[TMPL_NAME].onRendered(function() {
	const that = this;
	$('#createDocModal').on('opened', (ev,modalId)=>{	
		console.log(modalId);
		if(modalId=='#createDocModal') {
			const id = 'create'+that.tmplVar.get()+'Member';
			AutoForm.resetForm(id);	
		}
	});
});

Template[TMPL_NAME].helpers({
	collSchema() {
		const tmpl = Template.instance();
		return tmpl.schema.get();
	},
	tmplVar() {
		const tmpl = Template.instance();
		return tmpl.tmplVar.get();
	},
	meteormethod() {
		const tmpl = Template.instance();
		return tmpl.tmplVar.get()+'.create';
	},
	autoFormId() {
		const tmpl = Template.instance();
		return 'create'+tmpl.tmplVar.get()+'Member';
	},
	omitFields() {
		const allLang = Meteor.settings.public.availableLanguages
		,	omit = [];

		for(let i=1;i<allLang.length;i++) {
			omit.push(allLang[i]);
		}

		return omit;
	},
	isLangObject() {
		return (Meteor.settings.public.availableLanguages.indexOf(this.name)>-1);
	}
});

Template[TMPL_NAME].events({
	'click .save-doc'(ev,tmpl) {
		Meteor.modal('#createDocModal', 'hide');
	}
});