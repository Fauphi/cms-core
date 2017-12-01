/*
* @Author: philipp
* @Date:   2017-08-02 16:06:03
* @Last Modified by:   philipp
* @Last Modified time: 2017-12-01 12:19:46
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import { Collections, TMPL_SCHEMA } from '/imports/core/api/collectionPages/collectionPages.js';
import { CollectionTools } from '/imports/tools/CollectionTools.js';

import '/imports/core/ui/autoform/autoform-media-manager/autoform-media-manager.js';
import '/imports/core/ui/autoform/autoform-youtube-parser/autoform-youtube-parser.js';

import '/imports/core/ui/components/mediaManagerModal/mediaManagerModal.js';
import '/imports/core/ui/layouts/basic/basic.js';

import './editDoc.html';

const CollectionPagesTags = new Mongo.Collection('CollectionPagesTags');

const TMPL_NAME = 'sys_editPage';

Template[TMPL_NAME].onCreated(function() {
	const that = this;

	that.collection = new ReactiveVar(null);
	that.schema = new ReactiveVar(null);
	that.tmplVar = new ReactiveVar(null);
	that.page = new ReactiveVar(null);
	that.showDropdown = new ReactiveVar(false);
	that.tagFilterTrigger = new ReactiveVar(null);

	that.subscribe('all-collections', ()=>{
		const params = FlowRouter.current().params
		,	page = Collections.findOne({tmplVar: params._tmplVar});

		const coll = Mongo.Collection.get(page.collection);
		if(coll) that.collection.set(coll);
		else that.collection.set(new Mongo.Collection(page.collection)); 

		const schema = CollectionTools.parseSchema(page.baseSchema, page.langSchema, Meteor.settings.public.availableLanguages);

		that.schema.set(new SimpleSchema(schema));

		that.tmplVar.set(page.tmplVar);
		that.page.set(page);

		that.subscribe('all-'+page.tmplVar);
		that.subscribe(page.tmplVar+'-tags');

		const hooksObject = {
			beginSubmit() {
				console.log('start');
				Meteor.loader();
			},
	  		endSubmit() {
	  			Meteor.loader('hide');
	  		}
		}

		AutoForm.addHooks('update'+page.tmplVar+'Member', hooksObject);
	});

	$.cloudinary.config({
		cloud_name: Meteor.settings.public.CLOUDINARY_CLOUD_NAME,
		api_key: Meteor.settings.public.CLOUDINARY_API_KEY
	});
});

Template[TMPL_NAME].onRendered(function() {
	AutoForm.resetForm('updateProject');
});

Template[TMPL_NAME].events({
	'click [data-action="add-dropdown-tag"]'(ev, tmpl) {
		ev.stopPropagation();
		const tmplVar = tmpl.page.get().tmplVar
		,	id = FlowRouter.current().params._id;

		Meteor.call(tmplVar+'.addTag', id, this);
		tmpl.showDropdown.set(false);
	},
	'focus [data-action="add-tag"]'(ev, tmpl) {
		tmpl.showDropdown.set(true);
	},
	'focusout [data-action="add-tag"]'(ev, tmpl) {
		const isDropdownHovered = tmpl.$('.dropdown .entry:hover').length>0;
		if(!isDropdownHovered) tmpl.showDropdown.set(false);
	},
	'keyup [data-action="add-tag"]'(ev, tmpl) {
		tmpl.tagFilterTrigger.set(new Date().getTime());
		if(ev.keyCode==13) {
			const tmplVar = tmpl.page.get().tmplVar
			,	id = FlowRouter.current().params._id
			,	$elm = $(ev.target);

			Meteor.call(tmplVar+'.addTag', id, $elm.val());

			$elm.val('');
		}
	},
	'click [data-action="remove-tag"]'(ev, tmpl) {
		const tmplVar = tmpl.page.get().tmplVar
		,	id = FlowRouter.current().params._id;
		
		Meteor.call(tmplVar+'.removeTag', id, this);
	}
});

Template[TMPL_NAME].helpers({
	doc() {
		const tmpl = Template.instance()
		,	coll = tmpl.collection.get()
		,	id = FlowRouter.current().params._id;

		return coll && coll.findOne({_id: id});
	},
	collSchema() {
		const tmpl = Template.instance();
		return tmpl.schema.get();
	},
	baseUrl() {
		return Meteor.settings.public.url;
	},
	urlLang() {
		const tmpl = Template.instance();
		return (tmpl.selectedLanguage.get()=='en')?'en/':'';
	},
	tmplVar() {
		const tmpl = Template.instance();
		return tmpl.tmplVar.get();
	},
	formId() {
		const tmpl = Template.instance();
		return 'update'+tmpl.tmplVar.get()+'Member';
	},
	page() {
		const tmpl = Template.instance();
		return tmpl.page.get();
	},
	titleKeys() {
		const tmpl = Template.instance()
		,	page = tmpl.page.get();

		if(page) {
			let	title = '';

			for(let key of page.titleKeys) {
				title += key.split('.').reduce((o,i)=>o[i], this)+' '; // get val from dot notation: 'de.title'
			}

			return title;
		}
	},
	meteormethod() {
		const tmpl = Template.instance();
		return tmpl.tmplVar.get()+'.update';
	},
	getMainLanguageValue(key) {
		const mainLang = Meteor.settings.public.availableLanguages[0];
		return this[mainLang] && this[mainLang][key];
	},
	isLangObject() {
		return (Meteor.settings.public.availableLanguages.indexOf(this.name)>-1);
	},
	langLabel(lang) {
		return Meteor.settings.public.languageLables[lang];
	},
	getAllTags() {
		const trigger = Template.instance().tagFilterTrigger.get();

		const inputValue = $('input[data-action="add-tag"]').val()
		,	result = CollectionPagesTags.find({}).fetch()[0] || [];
		let filtered = result.tags;

		if(/\S/.test(inputValue)) {
			filtered = filtered.filter((el)=>{
				if(el.match(new RegExp(inputValue, 'gi'))) return el;
			});	
		}

		return filtered;
	},
	showDropdown() {
		const tmpl = Template.instance();
		return tmpl.showDropdown.get();
	}
});