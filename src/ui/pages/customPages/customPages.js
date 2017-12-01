/*
* @Author: philipp
* @Date:   2017-08-25 14:57:07
* @Last Modified by:   philipp
* @Last Modified time: 2017-11-30 13:19:06
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';

import { CustomPages } from '/imports/core/api/customPages/customPages.js';

const GroupedCustomPages = new Mongo.Collection('GroupedCustomPages');

import './modals/createCustomPage.js';

import './customPages.html';

const TMPL_NAME = 'core_customPages'
,	TMPL_VAR = 'customPages'
,	TMPL_COLL = CustomPages
,	PAGE_COUNT = 6;

Template[TMPL_NAME].onCreated(function() {
	const that = this;

	that.currentPage = new ReactiveVar(0);
	that.pageCount = new ReactiveVar(0);
	that.pageType = new ReactiveVar(null);
	that.searchValue = new ReactiveVar(null);

	// that.subscribe('grouped-custom-pages', {
	// 	onReady() {
	// 		const queryParams = FlowRouter.current().queryParams
	// 		,	query = (queryParams.type)?{'pages.0.type': queryParams.type}:{}
	// 		,	all = GroupedCustomPages.find(query).count();
			
	// 		that.pageCount.set(Math.ceil(all / PAGE_COUNT));
	// 	}
	// });

	that.autorun(()=>{
		that.subscribe('grouped-custom-pages', {
			onReady() {
				const queryParams = FlowRouter.current().queryParams
				,	query = (queryParams.type)?{'pages.0.type': queryParams.type}:{}
				,	all = GroupedCustomPages.find(query).count();
				
				that.pageCount.set(Math.ceil(all / PAGE_COUNT));
			}
		});
		
		FlowRouter.watchPathChange();

		const queryParams = FlowRouter.current().queryParams
		,	current = queryParams.p || 0;

		Session.set('customPagesPageNumber', current);

		if(queryParams.type) {
			that.pageType.set(queryParams.type);
			Session.set('customPagesPageType', queryParams.type);
		} else {
			Session.set('customPagesPageType', null);
		}

		that.currentPage.set(current);

		that.subscribe('page-'+TMPL_VAR, PAGE_COUNT, that.currentPage.get());

		// @INFO: Changed, due to grouped docs
		// Meteor.call(TMPL_VAR+'.pageCount', (err,res) => {
		// 	that.pageCount.set(Math.ceil(res / PAGE_COUNT));
		// });
	});
});

Template[TMPL_NAME].onRendered(function() {
	AutoForm.resetForm('createDoc');
});

Template[TMPL_NAME].helpers({
	pageDocs() {
		const tmpl = Template.instance()
		,	currentPage = tmpl.currentPage.get()
		,	query = {};

		if(tmpl.pageType.get()) query['pages.0.type'] = tmpl.pageType.get();

		const searchVal = tmpl.searchValue.get();
		if(searchVal && /\S/.test(searchVal)) {
			query['pages.0.title'] = {$regex: new RegExp(searchVal, 'gi')};
			return GroupedCustomPages.find(query);
		} else {
			return GroupedCustomPages.find(query, {sort: {createdAt: -1}, skip: currentPage*PAGE_COUNT, limit: PAGE_COUNT});	
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
	shortenString(string, length) {
		if(string) {
			const dots = (string.length>length)?'...':'';
			return string.substr(0, length-1)+dots;
		}
	},
	enPublic() {
		const doc = TMPL_COLL.findOne({slug: this.slug, language: 'en'});
		return doc.public;
	},
	tmplVar() {
		return TMPL_VAR;
	},
	getMainLanguageValue(key) {
		const mainLang = Meteor.settings.public.availableLanguages[0];
		let mainLangObj = null;
		
		for(let obj of this.pages) {
			if(obj.language==mainLang) {
				mainLangObj = obj;
				break;
			}
		}

		if(!mainLangObj) mainLangObj = this.pages[0];

		return mainLangObj && mainLangObj[key];
	},
	getPageLanguages() {
		let languages = "";

		for(let obj of this.pages) {
			languages += obj.language+", ";
		}

		return languages.replace(/(, )$/, '');
	},
	resizeImage(url) {
		if(url) {
			const split = url.split('upload/');
			return (split && split.length>1)?split[0]+'upload/h_400/'+split[1]:url;
		}
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
	},
	isSearchResults() {
		const tmpl = Template.instance()
		,	searchVal = tmpl.searchValue.get();
		return (searchVal && /\S/.test(searchVal));
	}
});

Template[TMPL_NAME].events({
	'click [data-action="change-page"]'(ev,tmpl) {
		tmpl.currentPage.set(this);
		const queryParams = FlowRouter.current().queryParams;
		let strParams = '?'
		
		queryParams.p = this;

		for(let key in queryParams) {
			strParams += key+'='+queryParams[key]+'&';
		}

		FlowRouter.go('/custom'+strParams.replace(/&$/, ''));
	},
	'click [data-action="delete-doc-modal"]'(ev,tmpl) {
		ev.preventDefault();
		tmpl.deleteDocId = this._id;
		Meteor.modal('#deleteDocModal');
	},
	'click [data-action="delete-doc"]'(ev,tmpl) {
		const id = tmpl.deleteDocId;
		if(id) {
			Meteor.loader('show', 'Deleting page');
			Meteor.call(TMPL_VAR+'.deleteAllPageVersions', id, () => {
				Meteor.modal('#deleteDocModal', 'hide');
				Meteor.loader('hide');
			});
		}
	},
	'click [data-action="change-doc-order-modal"]'(ev,tmpl) {
		ev.preventDefault();
		Meteor.modal('#changeDynamicPageOrderModal');
	},
	'click [data-action="create-doc-modal"]'() {
		Meteor.modal('#core_createCustomPage');
	},
	'keyup [data-action="search"]'(ev,tmpl) {
		const searchVal = $(ev.target).val();
		tmpl.searchValue.set(searchVal);
	}
});