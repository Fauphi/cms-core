/*
* @Author: philipp
* @Date:   2017-07-04 15:41:42
* @Last Modified by:   philipp
* @Last Modified time: 2017-09-06 22:29:52
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { Sitemap } from '/imports/core/api/sitemap/sitemap.js';

import './sitemap.html';
import '/imports/core/ui/components/langContainer/langContainer.js';

Template.sitemap.onCreated(function() {
	const that = this
	,	langs = Meteor.settings.public.availableLanguages;

	that.lang = new ReactiveVar(langs[0]);

	Meteor.subscribe('sitemap');
});

Template.sitemap.helpers({
	selectedLang() {
		const tmpl = Template.instance()
		,	lang = tmpl.lang.get();
		return Meteor.settings.public.languageLables[lang];
	},
	isSelected() {
		const tmpl = Template.instance()
		,	lang = tmpl.lang.get();
		return (lang==this);
	},
	parentPages() {
		const tmpl = Template.instance()
		,	lang = tmpl.lang.get();
		return Sitemap.find({sub: {$exists: false}, lang: lang}, {sort: {index: 1}});
	},
	childPages(parent) {
		const tmpl = Template.instance()
		,	lang = tmpl.lang.get();
		return Sitemap.find({sub: true, lang: lang, parent: parent});
	},
	availableLanguages() {
		return Meteor.settings.public.availableLanguages;
	},
	languageLabel() {
		return Meteor.settings.public.languageLables[this];
	}
});

Template.sitemap.events({
	'click [data-action="change-language"]'(ev,tmpl) {
		tmpl.lang.set(this);
	},
	'click [data-action="change-state"]'(ev) {
		const $btn = $(ev.target);
		
		$btn.attr('disabled', 'true');
		$btn.toggleClass('active');

		Meteor.call('sitemap.update', this._id, ()=>{
			$btn.removeAttr('disabled');
		});
	}
});