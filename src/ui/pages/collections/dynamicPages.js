/*
* @Author: philipp
* @Date:   2017-08-02 12:06:34
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 12:27:24
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { TMPL_COLL, TMPL_VAR } from '/imports/core/api/collections/collections.js';

import { CleanString } from '/imports/tools/CleanString.js';

import './modals/createDynamicPage.js';

import './dynamicPages.html';

const TMPL_NAME = 'sys_dynamicPages'
,	PAGE_COUNT = 6;

Template[TMPL_NAME].onCreated(function() {
	const that = this;

	that.currentPage = new ReactiveVar(0);
	that.pageCount = new ReactiveVar(0);

	that.autorun(()=>{
		const params = FlowRouter.current().queryParams
		,	current = params.p || 0;
		that.currentPage.set(current);

		that.subscribe('page-'+TMPL_VAR, PAGE_COUNT, that.currentPage.get());

		Meteor.call(TMPL_VAR+'.pageCount', (err,res) => {
			that.pageCount.set(Math.ceil(res / PAGE_COUNT));
		})
	});
});

Template[TMPL_NAME].onRendered(function() {
	AutoForm.resetForm('createDoc');
});

Template[TMPL_NAME].helpers({
	pageDocs() {
		const tmpl = Template.instance()
		,	currentPage = tmpl.currentPage.get();
		return TMPL_COLL.find({}, {sort: {name: 1}, skip: currentPage*PAGE_COUNT, limit: PAGE_COUNT});
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
		return this[mainLang] && this[mainLang][key];
	}
});

Template[TMPL_NAME].events({
	'click [data-action="change-page"]'(ev,tmpl) {
		tmpl.currentPage.set(this);
		FlowRouter.go('/'+TMPL_VAR+'?p='+this);
	},
	'click [data-action="delete-doc-modal"]'(ev,tmpl) {
		ev.preventDefault();
		tmpl.deleteDocId = this._id;
		Meteor.modal('#deleteDocModal');
	},
	'click [data-action="delete-doc"]'(ev,tmpl) {
		const id = tmpl.deleteDocId;
		if(id) {
			Meteor.call(TMPL_VAR+'.delete', id, () => {
				Meteor.modal('#deleteDocModal', 'hide');
			});
		}
	},
	'click [data-action="change-doc-order-modal"]'(ev,tmpl) {
		ev.preventDefault();
		Meteor.modal('#changeDynamicPageOrderModal');
	},
	'click [data-action="create-doc-modal"]'() {
		Meteor.modal('#createDynamicPageModal');
	}
});
