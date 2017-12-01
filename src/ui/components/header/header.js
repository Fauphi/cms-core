/*
* @Author: Philipp
* @Date:   2016-10-05 16:32:13
* @Last Modified by:   philipp
* @Last Modified time: 2017-11-30 12:31:14
*/

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Collections } from '/imports/core/api/collectionPages/collectionPages.js';

import './header.html';

Template.header.onCreated(function created() {
	const that = this;

	that.subscribe('all-collections');
});

Template.header.helpers({
	getUser() {
		const user = Meteor.user();
		return user && user.profile && user.profile.firstname;
	},
	getProfileImage() {
		const user = Meteor.user();

		if(user && user.profile) {
			var split = (user.profile.profileImage)?user.profile.profileImage.split('/upload'):'';
			// if(split.length>1) return split[0]+'/upload/t_face_square'+split[1];	
			if(split.length>1) return split[0]+'/upload/w_40'+split[1];	
			else return user.profile.profileImage;
		}
	},
	companyName() {
		return Meteor.settings.public.companyName;
	},
	getPages() {
		return Collections.find({published: true}, {sort: {name: 1}});
	}
});

Template.header.events({
	'click [data-action="logout"]'() {
		AccountsTemplates.logout();
	}
});