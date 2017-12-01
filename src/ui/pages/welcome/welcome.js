/*
* @Author: Philipp
* @Date:   2016-10-05 16:32:13
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 12:22:55
*/

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './welcome.html';

Template.welcome.helpers({
	isReady() {
		return !!Meteor.user();
	},
	getName() {
		return Meteor.user() && Meteor.user().profile.firstname;
	}
});