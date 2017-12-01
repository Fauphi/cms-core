/*
* @Author: philipp
* @Date:   2017-08-08 17:14:37
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 13:09:15
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Collections } from '/imports/core/api/collectionPages/collectionPages.js';

import './changeDocOrder.html';

const TMPL_NAME = 'sys_changeDocOrderModal';

Template[TMPL_NAME].onCreated(function() {
	const that = this;

	that.collection = new ReactiveVar(null);
	that.tmplVar = new ReactiveVar(null);

	that.autorun(()=>{
		FlowRouter.watchPathChange();
		const params = FlowRouter.current().params;
		
		that.subscribe('all-collections', ()=>{
			const page = Collections.findOne({tmplVar: params._tmplVar})
			,	coll = Mongo.Collection.get(page.collection);

			if(coll) that.collection.set(coll);
			else that.collection.set(new Mongo.Collection(page.collection)); 

			that.tmplVar.set(page.tmplVar);
			that.subscribe('all-'+page.tmplVar);
		});
	});
});

Template[TMPL_NAME].onRendered(function() {
	$('#changeDocOrderModal').on('opened', ()=>{
		initSortable('.sortable');
	});
});

Template[TMPL_NAME].helpers({
	docs() {
		const tmpl = Template.instance()
		,	TMPL_COLL = tmpl.collection.get();

		return TMPL_COLL && TMPL_COLL.find({}, {sort: {index: 1}});
	},
	tmplVar() {
		const tmpl = Template.instance();

		return tmpl.tmplVar.get();
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
	pageName() {
		const tmpl = Template.instance()
		,	page = Collections.findOne({tmplVar: tmpl.tmplVar.get()});
		return page && page.name;
	}
});

Template[TMPL_NAME].events({
	'click [data-action="save-doc-order"]'(ev,tmpl) {
		const $btn = $(ev.target);
		let items = [];

		$('.sortable li').each((index, element) => {
			items.push({ _id: $(element).data('id'), index: index + 1});
		});

		$btn.button('loading');

		Meteor.call(tmpl.tmplVar.get()+'.updateOrder', items, (error) => {
			if(error) console.log(error.reason);
			else {
				$btn.button('reset');
				Meteor.modal('#changeDocOrderModal', 'hide');
			}
		});
	}
});

const initSortable = (sortableClass) => {
	let sortableList = $(sortableClass);
	sortable('destroy');
	sortable(sortableClass);
};