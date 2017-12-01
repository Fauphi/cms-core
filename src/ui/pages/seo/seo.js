/*
* @Author: Philipp
* @Date:   2016-10-05 16:32:13
* @Last Modified by:   philipp
* @Last Modified time: 2017-09-06 15:23:14
*/

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { SEO } from '/imports/core/api/seo/seo.js';

import '/imports/core/api/translations/translations.js';
import '/imports/core/ui/components/header/header.js';
import '/imports/core/ui/components/footer/footer.js';
import './seo.html';

const fileExceptions = ['custom']
,	folderExceptions = ['partials'];

Template.seo.onCreated(function created() {
	const that = this;

	that.filter = new ReactiveVar('all');
	that.search = new ReactiveVar('');
	that.lang = new ReactiveVar('de');
	that.templateFiles = new ReactiveVar();

	Meteor.call('translations.getFiles', (err, res) => {
		that.templateFiles.set(res);
	});

	that.subscribe('all-seo');
});

Template.seo.helpers({
	templateFiles() {
		const tmpl = Template.instance()
		,	cleanedUpFiles = [{key: 'base', files: []}];

		if(tmpl) {
			const files = tmpl.templateFiles.get() || [];

			for(let item of files) {
				const split = item.split('/')
				,	key = (split.length>1)?split[0]:'base'
				,	name = (split.length>2)?split[2]:((split.length>1)?split[1]: item)
				,	found = null;

				for(let itemKey of cleanedUpFiles) {
					if(itemKey.key==key) {
						found = itemKey;
						break;
					}
				}

				const fileObj = {key: item, name: name};

				// Use all template files except the one in the partials-folder and the customPage template
				if(fileExceptions.indexOf(name)==-1 && folderExceptions.indexOf(key)==-1) {
					if(found) found.files.push(fileObj);
					else cleanedUpFiles.push({key: key, files: [fileObj]});	
				}
			}

		}

		// for(let item of cleanedUpFiles) {
		// 	if(item.key=='base') item.files.unshift({key: 'headerImages', name: 'Header Images'});
		// }

		return cleanedUpFiles;
	},
	tagNames() {
		return Meteor.settings.public.seoTagNames;
	},
	getSEO() {
		const tmpl = Template.instance()
		,	filter = tmpl.filter.get()
		,	search = tmpl.search.get()
		,	query = (filter!='all')?{category: tmpl.filter.get()}:{};

		if(search) {
			const searchWord = new RegExp(search, 'gi');
			query['$or'] = [{key: searchWord}, {en: searchWord}, {de: searchWord}];
		}

		return SEO.find(query);
	},
	getCollection() {
		return SEO;
	},
	isFilterActive() {
		const tmpl = Template.instance()
		,	active = tmpl.filter.get();
		return active==this;
	},
	getFilters() {
		return Meteor.settings.public.seo;
	}
});

Template.seo.events({
	'keyup [data-action="search"]'(ev, tmpl) {
		tmpl.search.set($(ev.target).val());
	},
	'click [data-action="save"]'(ev, tmpl) {
		const $target = $(ev.target)
		,	$deInput = $target.parents('.item-row').find('textarea.de')
		,	$enInput = $target.parents('.item-row').find('textarea.en');

		Meteor.call('seo.update', this._id, {en: $enInput.val(), de: $deInput.val()});
	},
	'click [data-action="remove"]'() {
		Meteor.call('seo.remove', this._id);
	},
	'click [data-action="filter"]'(ev, tmpl) {
		const $target = $(ev.target)
		, filter = $target.data('filter');

		tmpl.filter.set(filter);
	},
	'click [data-action="show-create-entry"]'(ev) {
		if($('#seo .create-entry').is(':visible')) $(ev.target).html('show');
		else $(ev.target).html('hide');
		$('#seo .create-entry').toggle();
	}
});