/*
* @Author: philipp
* @Date:   2017-07-07 12:16:08
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 12:04:36
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './customPageTitleModal.html';

import { CustomPages } from '/imports/core/api/customPages/customPages.js';

Template.customPageTitleModal.onCreated(function() {
	const that = this
	,	route = FlowRouter.getRouteName()
	,	parent = (route=='events')?'news/events':route;

	that.subscribe('all-custom-pages-of-type', parent);

	that.titleExists = new ReactiveVar(false);
});

Template.customPageTitleModal.helpers({
	titleExists() {
		const tmpl = Template.instance();
		console.log('exists: ', tmpl.titleExists.get());
		return tmpl && tmpl.titleExists.get();
	}
});

Template.customPageTitleModal.events({
	'keyup [data-action="check-title"]'(ev, tmpl) {
		const $input = $(ev.target)
		,	val = $input.val().trim()
		,	regExp = new RegExp('^'+val+'$', 'i')
		,	exists = CustomPages.findOne({$or: [{'de.title': regExp}, {'en.title': regExp}]});
		
		tmpl.titleExists.set(!!exists);
	},
	'click [data-action="create"]'(ev,tmpl) {
		if(!tmpl.titleExists.get()) {
			const $btn = $(ev.target)
			,	route = FlowRouter.getRouteName()
			,	title = $('#title-input').val(); 

			$btn.attr('disabled', 'true');

			if(/\S/.test(title)) {
				Meteor.call('customPages.create', route, title, function(err, res) {
					$btn.removeAttr('disabled');
					FlowRouter.go('/custom-pages/'+res);

					// close/remove modal
					$('#customPageTitleModal').modal('hide');
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
				});
			} else {
				$('#customPageTitleModal .error').show();
			}
		}
	}
});