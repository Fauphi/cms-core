/*
* @Author: philipp
* @Date:   2017-08-22 15:44:42
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 16:23:50
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import { Media } from '/imports/core/api/mediaManager/mediaManager.js';

import './mediaFilter.html';

const clientAggregatedMedia = new Mongo.Collection('clientAggregatedMedia');

const TMPL_NAME = 'core_mediaFilter';

const filters = {
	time: [{value: 'all', label: 'all'}, {value: 'today', label: 'today'}, {value: 'week', label: 'this week'}, {value: 'month', label: 'this month'}],
	tags: [{value: 'kongress', label: 'kongress'}, {value: 'china', label: 'china'}]
};

Template[TMPL_NAME].onCreated(function () {
	const that = this;

	that.filter = new ReactiveVar({time: 'all', author: null, tags: []});

	that.subscribe('all-users');
	that.subscribe('all-media');
	that.subscribe('aggregated-media');

	that.filterFn = (settings) => {
		let query = {type: 'image'}
		,	sort = {sort: {createdAt: -1}};

		// time
		if(settings.time=='today') {
			query.createdAt = {$gte: (moment().startOf('day').unix()*1000)};
		} else if(settings.time=='week') {
			query.createdAt = {$gte: (moment().startOf('week').unix()*1000)};
		} else if(settings.time=='month') {
			query.createdAt = {$gte: (moment().startOf('month').unix()*1000)};
		}
		// author
		if(settings.author) query.creator = settings.author;
		// tags
		if(settings.tags.length>0) query.tags = {$all: settings.tags};

		Session.set('mediaFilterQuery', {query: query, sort: sort});
	}

	// init filtering
	that.filterFn(that.filter.get());
});

Template[TMPL_NAME].helpers({
	filters() {
		return filters;
	},
	isAllFilter() {
		const tmpl = Template.instance()
		,	filter = tmpl.filter.get();

		return (filter.time=='all');
	},
	isActiveFilter(type, value) {
		const tmpl = Template.instance()
		,	filter = tmpl.filter.get();

		if(type=='tags') return (filter.tags.indexOf(value)>-1)?'active':'';
		else return (filter[type]==value)?'active':'';
	},
	getAllAuthors() {
		return clientAggregatedMedia.find({}).fetch();
	},
	getAuthorName() {
		const user = Meteor.users.findOne({_id: this._id});
		return user && (user.username)?user.username:'n/a';
	}
});

Template[TMPL_NAME].events({
	'click [data-action="change-filter"]'(ev,tmpl) {
		ev.stopPropagation();
		const $elm = $(ev.target)
		,	filterType = $elm.data('type')
		,	filterValue = $elm.data('value')
		, 	filter = tmpl.filter.get();

		if(filterType=='tag' && filter.tags.indexOf(filterValue)>-1) filter.tags.splice(filter.tags.indexOf(filterValue), 1);
		else if(filterType=='tag') filter.tags.push(filterValue);
		else if(filterType=='author' && filter.author==filterValue) filter.author = null;
		else filter[filterType] = filterValue;

		tmpl.filter.set(filter);
		tmpl.filterFn(filter);
	}
});
