/*
* @Author: philipp
* @Date:   2017-07-04 12:01:40
* @Last Modified by:   philipp
* @Last Modified time: 2017-07-04 12:15:11
*/

'use strict';

import './langContainer.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

Template.langContainer.onCreated(function() {
	Session.set('langContainerSelectedLang', 'de');
});

Template.langContainer.helpers({
	selectedLang(lang) {
		return (lang==Session.get('langContainerSelectedLang'));
	}
});

Template.langContainer.events({
	'click [data-action="switch-lang"]'(ev, tmpl) {
		const $target = $(ev.target)
		,	$elm = ($target.is('span'))?$target.parent():$target
		,	lang = $elm.data('lang');

		Session.set('langContainerSelectedLang', lang);
	},
});