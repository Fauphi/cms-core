/*
* @Author: philipp
* @Date:   2017-08-08 17:14:37
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 12:27:33
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { TMPL_SCHEMA, TMPL_VAR } from '/imports/core/api/collections/collections.js';

import { CleanString } from '/imports/tools/CleanString.js';

import './createDynamicPage.html';

const TMPL_NAME = 'createDynamicPage';

Template[TMPL_NAME].onCreated(function() {
	const that = this;
});

Template[TMPL_NAME].onRendered(function() {
	$('#createDynamicPageModal').on('opened', ()=>{	
		const id = 'create'+TMPL_VAR;
		AutoForm.resetForm(id);
	});
});

Template[TMPL_NAME].helpers({
	collSchema() {
		return TMPL_SCHEMA;
	},
	tmplVar() {
		return TMPL_VAR;
	},
	meteormethod() {
		return TMPL_VAR+'.create';
	},
	autoFormId() {
		return 'create'+TMPL_VAR;
	},
	omitFields() {
		return ['en'];
	}
});

Template[TMPL_NAME].events({
	'click .save-doc'(ev,tmpl) {
		Meteor.modal('#createDynamicPageModal', 'hide');
	}
});