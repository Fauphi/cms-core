/*
* @Author: philipp
* @Date:   2017-08-02 12:06:34
* @Last Modified by:   philipp
* @Last Modified time: 2017-09-22 11:24:51
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Media } from '/imports/core/api/mediaManager/mediaManager.js';

import '/imports/core/ui/components/mediaFilter/mediaFilter.js';

import './autoform-media-manager.html';

AutoForm.addInputType('mediaManager', {
	template: 'afMediaManager',

	valueOut: function () {
		return this.val();
	}
});

const templates = ['afMediaManager']
,	LIMIT_PLUS = 10;

_.each(templates, function (tmpl) {
	Template[tmpl].onCreated(function () {
		const that = this;

		that.url = new ReactiveVar();
		that.imageWasSelected = false;

		that.initialValueChecked = false;
		that.checkInitialValue = function () {
			Tracker.nonreactive(function () {
				if(!that.initialValueChecked && !that.url.get() && that.data.value) {
					that.url.set(that.data.value);
					that.initialValueChecked = true;
				}
			});
		};
		
		that.limit = new ReactiveVar(LIMIT_PLUS);

		that.subscribe('all-media');
	});

	Template[tmpl].helpers({
		getMediaImages() {
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
		isPreviousOtherDay() {
			const previous = moment(this.previousCreatedAt).startOf('day').unix()
			,	current = moment(this.createdAt).startOf('day').unix();

			return (previous!=current)?moment(this.createdAt).format('DD. MMM.'):false;
		},
		resizeImage(height) {
			const _height = height || 200
			,	split = (this.url)?this.url.split('upload/'):null;
			return split && split[0]+'upload/h_'+_height+'/'+split[1];
		},
		moreAvailable() {
			const tmpl = Template.instance()
			, 	current = tmpl.limit.get()
			,	query = Session.get('mediaFilterQuery')
			, 	count = Media.find(query.query, query.sort).count();

			return (count>=current);
		},
		unsupportedFormat() {
			const formats = ['png', 'jpg', 'jpeg'];
			return !(formats.indexOf(this.cloudinary.format)>-1);
		},
		url: function () {
		  var t = Template.instance();
		  t.checkInitialValue();
		  var url = t.url.get();

		  var split = (url)?url.split('upload/'):null;
		  return split && split[0]+'upload/h_200/'+split[1];
		},
		cleanUrl: function () {
		  var t = Template.instance();
		  t.checkInitialValue();
		  return t.url.get();
		},
		isImage: function() {
		  var t = Template.instance()
		  , data = t.url.get();

		  if(data) {
		    return data.match(/(.jpg|.jpeg|.png)/g);
		  }
		},
		getFileName: function() {
		  var t = Template.instance()
		  , data = t.url.get();

		  if(data) {
		    var split = data.split('.');
		    return split[split.length-1];
		  }
		}
	});

	Template[tmpl].events({
		'click [data-action="media-manager-modal"]'(ev,tmpl) {
			// We cannot use "Meteor.modal()" here because every autoform-image has its own media manager modal.
			// @TODO: Maybe we can reduce this sometime...
			tmpl.$('#media-manager-modal').addClass('in');
		},
		'click [data-action="cancel-modal"]'(ev,tmpl) {
			// We cannot use "Meteor.modal()" here because every autoform-image has its own media manager modal.
			// @TODO: Maybe we can reduce this sometime...
			tmpl.$('#media-manager-modal').removeClass('in');
		},
		'click [data-action="use-mm-image"]'(ev,tmpl) {
			console.log('USE');
			console.log(this.url);
			ev.stopPropagation();
			ev.preventDefault();

			tmpl.imageWasSelected = true;

			tmpl.url.set(this.url);
			Tracker.flush();

			// close modal
			// We cannot use "Meteor.modal()" here because every autoform-image has its own media manager modal.
			// @TODO: Maybe we can reduce this sometime...
			tmpl.$('#media-manager-modal').removeClass('in');
		},
		'click [data-action="load-more"]'(ev, tmpl) {
			ev.stopPropagation();
			ev.preventDefault();
			const current = tmpl.limit.get()
			,	count = Media.find({type: 'image'}).count();

			if(count>=current) tmpl.limit.set(current+LIMIT_PLUS);
		}
	});
});
