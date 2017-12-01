/*
* @Author: Philipp
* @Date:   2017-03-20 13:07:50
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 16:38:52
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Media } from '/imports/core/api/mediaManager/mediaManager.js';

import '/imports/core/ui/components/imageUpload/multiupload.js';
import '/imports/core/ui/components/mediaFilter/mediaFilter.js';

import './mediaManager.html';

const LIMIT_PLUS = 10;

Template.mediaManager.onCreated(function() {
	const that = this;
	that.subscribe('all-media');
	that.subscribe('all-user');

	that.deleteImgId = new ReactiveVar(null);
	that.limit = new ReactiveVar(LIMIT_PLUS);
});

Template.mediaManager.helpers({
	isPreviousOtherDay() {
		const previous = moment(this.previousCreatedAt).startOf('day').unix()
		,	current = moment(this.createdAt).startOf('day').unix();

		return (previous!=current)?moment(this.createdAt).format('DD. MMM.'):false;
	},
	getImages() {
		const tmpl = Template.instance()
		,	query = Session.get('mediaFilterQuery');

		query.sort.limit = tmpl.limit.get();

		const mediaArr = Media.find(query.query, query.sort).fetch();
		let previousCreatedAt = 0;
		for(let item of mediaArr) {
			item.previousCreatedAt = previousCreatedAt;
			previousCreatedAt = item.createdAt;
		}

		return mediaArr;
	},
	getUser() {
		const user = Meteor.users.findOne({_id: this.creator});
		return user && user.profile && user.profile.firstname+' '+user.profile.lastname;
	},
	getDate() {
		return moment(this.createdAt).format('DD.MM.YYYY, HH:mm');
	},
	resizeImage() {
		const split = this.url.split('upload/');
		return split[0]+'upload/h_200/'+split[1];
	},
	moreAvailable() {
		const tmpl = Template.instance()
		,	current = tmpl.limit.get()
		,	query = Session.get('mediaFilterQuery')
		,	count = Media.find(query.query, query.sort).count();

		return (count>=current);
	}
});

Template.mediaManager.events({
	'click [data-action="delete-img-modal"]'(ev,tmpl) {
		tmpl.deleteImgId.set(this._id);
		Meteor.modal('#deleteImgModal');
	},
	'click [data-action="delete-img"]'(ev,tmpl) {
		const imgId = tmpl.deleteImgId.get()
		,	$btn = $(ev.target);
		ev.preventDefault();
		ev.stopPropagation();

		$btn.button('loading');

		Meteor.call('mediaManager.delete', imgId, ()=>{
			$btn.button('reset');
			Meteor.modal('#deleteImgModal', 'hide');
		});
	},
	'click [data-action="load-more"]'(ev, tmpl) {
		const current = tmpl.limit.get()
		,	count = Media.find({type: 'image'}).count();

		if(count>=current) tmpl.limit.set(current+LIMIT_PLUS);
	}
});