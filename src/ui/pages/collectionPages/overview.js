/*
* @Author: philipp
* @Date:   2017-08-02 12:06:34
* @Last Modified by:   philipp
* @Last Modified time: 2017-11-30 18:09:41
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Mongo } from 'meteor/mongo';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import { Collections } from '/imports/core/api/collectionPages/collectionPages.js';

import { CleanString } from '/imports/tools/CleanString.js';

import './modals/createDoc.js';
import './modals/changeDocOrder.js';
import '/imports/core/ui/layouts/basic/basic.js';

import './overview.html';

const TMPL_NAME = 'sys_pages'
,	PAGE_COUNT = 6;

Template[TMPL_NAME].onCreated(function() {
	const that = this;

	that.currentPage = new ReactiveVar(0);
	that.pageCount = new ReactiveVar(0);
	that.collection = new ReactiveVar(null);
	that.tmplVar = new ReactiveVar(null);
	that.searchValue = new ReactiveVar(null);
	that.selectedTags = new ReactiveVar(null);

	that.autorun(()=>{
		FlowRouter.watchPathChange();
		const params = FlowRouter.current().params;
		
		that.subscribe('all-collections', ()=>{
			Meteor.call('collectionPages.init');

			const page = Collections.findOne({tmplVar: params._tmplVar})
			,	coll = Mongo.Collection.get(page.collection);

			if(coll) that.collection.set(coll);
			else that.collection.set(new Mongo.Collection(page.collection)); 

			that.tmplVar.set(page.tmplVar);
			that.subscribe('all-'+page.tmplVar);

			AutoForm.resetForm('createDoc');
		});

		const queryParams = FlowRouter.current().queryParams
		,	current = queryParams.p || 0;
		that.currentPage.set(current);

		that.subscribe('page-'+that.tmplVar.get(), PAGE_COUNT, that.currentPage.get());

		Meteor.call(that.tmplVar.get()+'.pageCount', (err,res) => {
			that.pageCount.set(Math.ceil(res / PAGE_COUNT));
		});
	});
});

Template[TMPL_NAME].onRendered(function() {
	AutoForm.resetForm('createDoc');
});

Template[TMPL_NAME].helpers({
	pageDocs() {
		const tmpl = Template.instance()
		,	currentPage = tmpl.currentPage.get()
		,	TMPL_COLL = tmpl.collection.get();

		const searchVal = tmpl.searchValue.get()
		,	selectedTags = tmpl.selectedTags.get()
		,	hasSearch = (searchVal && /\S/.test(searchVal))
		,	hasTags = (selectedTags && selectedTags.length>0);

		if(hasSearch || hasTags) {
			const page = Collections.findOne({tmplVar: tmpl.tmplVar.get()})
			,	query = {};

			if(hasSearch) query[page.titleKeys[0]] = {$regex: new RegExp(searchVal, 'gi')};
			if(hasTags) query.tags = {$in: selectedTags};

			return TMPL_COLL && TMPL_COLL.find(query);
		} else {
			return TMPL_COLL && TMPL_COLL.find({}, {sort: {index: 1}, skip: currentPage*PAGE_COUNT, limit: PAGE_COUNT});
		}
	},
	pages() {
		const tmpl = Template.instance()
		,	count = tmpl.pageCount.get();
		return Array.apply(null, {length: count}).map(Number.call, Number);
	},
	isActivePage() {
		const tmpl = Template.instance();
		return (this==tmpl.currentPage.get());
	},
	enPublic() {
		const tmpl = Template.instance()
		,	TMPL_COLL = tmpl.collection.get()
		,	doc = TMPL_COLL.findOne({slug: this.slug, language: 'en'});
		return doc.public;
	},
	tmplVar() {
		const tmpl = Template.instance();
		return tmpl.tmplVar.get();
	},
	pageName() {
		const tmpl = Template.instance()
		,	page = Collections.findOne({tmplVar: tmpl.tmplVar.get()});
		return page && page.name;
	},
	getMainLanguageValue(key) {
		const mainLang = Meteor.settings.public.availableLanguages[0];
		return this[mainLang] && this[mainLang][key];
	},
	titleKeys() {
		const tmpl = Template.instance()
		,	page = Collections.findOne({tmplVar: tmpl.tmplVar.get()});

		if(page) {
			let	title = '';

			for(let key of page.titleKeys) {
				title += key.split('.').reduce((o,i)=>o[i], this)+' '; // get val from dot notation: 'de.title'
			}

			return title;
		}
	},
	subTitleKeys() {
		const tmpl = Template.instance()
		,	page = Collections.findOne({tmplVar: tmpl.tmplVar.get()});

		if(page) {
			let	title = '';

			for(let key of page.subTitleKeys) {
				title += key.split('.').reduce((o,i)=>o[i], this)+' | '; // get val from dot notation: 'de.title'
			}

			title = title.replace(/( \| )$/, '');

			return (title!='undefined')?title:'-';
		}
	},
	imageKey() {
		const tmpl = Template.instance()
		,	page = Collections.findOne({tmplVar: tmpl.tmplVar.get()});

		if(page && page.imageKey) {
			const url = page.imageKey.split('.').reduce((o,i)=>o[i], this)
			,	split = (url)?url.split('upload/'):null;
			return split && split[0]+'upload/h_200/'+split[1];
		}
	},
	isTable() {
		const params = FlowRouter.current().params
		,	page = Collections.findOne({tmplVar: params._tmplVar});
		return (page.view=='table');
	},
	shortenString(string, length) {
		if(string) {
			const dots = (string.length>length)?'...':'';
			return string.substr(0, length-1)+dots;
		}
	},
	allTags() {
		const tmpl = Template.instance()
		,	TMPL_COLL = tmpl.collection.get();

		if(TMPL_COLL) {
			const all = TMPL_COLL.find({}).fetch();
			let tags = [];

			for(let doc of all) {
				tags = tags.concat(doc.tags);
			}

			return Array.from(new Set(tags)).filter((el)=>{ if(/\S/.test(el)) return el; });
		}
	},
	isActiveTag() {
		const tmpl = Template.instance()
		,	selTags = tmpl.selectedTags.get();
		return selTags && selTags.indexOf(this)>-1;
	}
});

Template[TMPL_NAME].events({
	'click [data-action="select-tag"]'(ev,tmpl) {
		const selTags = tmpl.selectedTags.get() || []
		,	idx = selTags.indexOf(this);

		if(idx>-1) selTags.splice(idx,1);
		else selTags.push(this);

		tmpl.selectedTags.set(selTags);
	},
	'click [data-action="change-page"]'(ev,tmpl) {
		tmpl.currentPage.set(this);
		FlowRouter.go('/pages/'+tmpl.tmplVar.get()+'?p='+this);
	},
	'click [data-action="delete-doc-modal"]'(ev,tmpl) {
		ev.preventDefault();
		tmpl.deleteDocId = this._id;
		Meteor.modal('#deleteDocModal');
	},
	'click [data-action="delete-doc"]'(ev,tmpl) {
		const id = tmpl.deleteDocId;
		if(id) {
			Meteor.call(tmpl.tmplVar.get()+'.delete', id, () => {
				Meteor.modal('#deleteDocModal', 'hide');
			});
		}
	},
	'click [data-action="change-doc-order-modal"]'(ev,tmpl) {
		ev.preventDefault();
		Meteor.modal('#changeDocOrderModal');
	},
	'click [data-action="create-doc-modal"]'() {
		Meteor.modal('#createDocModal');
	},
	'keyup [data-action="search"]'(ev,tmpl) {
		const searchVal = $(ev.target).val();
		tmpl.searchValue.set(searchVal);
	}
});
