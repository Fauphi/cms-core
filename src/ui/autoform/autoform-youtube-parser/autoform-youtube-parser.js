/*
* @Author: philipp
* @Date:   2017-08-02 12:06:34
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-25 13:36:59
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoForm } from 'meteor/aldeed:autoform';

import './autoform-youtube-parser.html';

AutoForm.addInputType('youtubeParser', {
	template: 'afYoutubeParser',

	valueOut: function () {
		return this.val();
	}
});

const templates = ['afYoutubeParser'];

_.each(templates, function (tmpl) {
	Template[tmpl].onCreated(function () {
		const that = this;

		that.url = new ReactiveVar();
		that.previewId = new ReactiveVar();
		that.error = new ReactiveVar(false);

		that.initialValueChecked = false;
		that.checkInitialValue = function () {
			Tracker.nonreactive(function () {
				if(!that.initialValueChecked && !that.url.get() && that.data.value) {
					that.url.set(that.data.value);
					that.previewId.set(that.data.value);
					that.initialValueChecked = true;
				}
			});
		};

		that.getYoutubeId = (url)=>{
			if(url) {
				const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/
    			,	match = url.match(regExp);
    			return (match&&match[7].length==11)? match[7] : false;	
			} else return false;
		}
		
	});

	Template[tmpl].helpers({
		youtubeId() {
			var tmpl = Template.instance();
			tmpl.checkInitialValue();
			return tmpl.url.get();
		},
		previewId() {
			var tmpl = Template.instance();
			tmpl.checkInitialValue();
			
			return tmpl.getYoutubeId(tmpl.previewId.get());
		}
	});

	Template[tmpl].events({
		'keyup [data-action="validate-url"]'(ev,tmpl) {
			tmpl.error.set(false);
			const $input = $(ev.target)
			,	url = $input.val()
			,	validId = tmpl.getYoutubeId(url);

			tmpl.previewId.set(url);

			if(validId) tmpl.url.set(url);
			else tmpl.error.set(true);
		}
	});
});
