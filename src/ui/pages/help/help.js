/*
* @Author: philipp
* @Date:   2017-07-27 13:55:46
* @Last Modified by:   philipp
* @Last Modified time: 2017-07-27 15:04:20
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './help.html';

Template.help.onCreated(function() {
	const that = this;

	that.activeView = new ReactiveVar();

	that.autorun(() => {
		FlowRouter.watchPathChange();
		const params = FlowRouter.current().queryParams
		,	view = (params.view)?params.view:'Contact';
		that.activeView.set(view);
	});

});

Template.help.helpers({
	isActive(view) {
		const tmpl = Template.instance();
		return (tmpl.activeView.get()==view);
	},
	getActiveName() {
		const tmpl = Template.instance();
		return tmpl.activeView.get();
	}
});