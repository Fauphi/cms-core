/*
* @Author: Philipp
* @Date:   2017-06-08 14:20:39
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 12:05:17
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { CustomPages } from '/imports/core/api/customPages/customPages.js';

import './fileUpload.html';

Template.fileUpload.onCreated(function() {
	const that = this;

	this.uploading = new ReactiveVar(false);
	this.cdata = new ReactiveVar();

	$.cloudinary.config({
		cloud_name: Meteor.settings.public.CLOUDINARY_FILES_CLOUD_NAME,
		api_key: Meteor.settings.public.CLOUDINARY_FILES_API_KEY
	});

	Meteor.call('customPages.cloudinaryFileToken', (err,res) => {
		if(!err) {
			that.cdata.set({ 
				"timestamp": res.timestamp, 
				"callback": "https://www.example.com/cloudinary_cors.html",
				"signature": res.token, 
				"api_key": Meteor.settings.public.CLOUDINARY_FILES_API_KEY
			});
		}
		
	});
});

Template.fileUpload.helpers({
	getCData() {
		const tmpl = Template.instance()
		,	cdata = tmpl.cdata.get();

		if(cdata && $.fn.cloudinary_fileupload !== undefined) {
			const $input = $("#fileUpload input#cloudinary-upload[type=file]")
			,	$button = $('[data-action="select-img"]')
			,	$progress = $('#fileUpload #progress-bar')
			,	$percent = $('#fileUpload #percent');

			// init cloudinary upload input
			$input.attr('data-form-data', JSON.stringify(cdata));
			$input.cloudinary_fileupload();
			
			// cloudinary upload callbacks
			$input
				.on('fileuploadsend', (ev, data) => {
					$progress.show();
					$percent.show();
					$button.hide();
				})
				.on('fileuploaddone', (ev, data) => {
					if(data.textStatus=='success') {
						const cloudinaryData = data.result
						,	pageId = FlowRouter.getParam('_id');
						
						// // update media db
						Meteor.call('customPages.addAttachement', {url: cloudinaryData.secure_url, name: cloudinaryData.original_filename, type: 'file', pageId: pageId, cloudinary: cloudinaryData}, () => {
							$progress.css('width', '0%');
							$percent.html('0%');
							$progress.hide();
							$percent.hide();
							$button.show();
						});
					}
				}).on('fileuploadprogress', (ev, data) => {
					const percent = Math.floor((data.loaded * 100.0) / data.total) + '%';
					$progress.css('width', percent);
					$percent.html(percent);
				});
		}
	},
	isUploading() {
		const tmpl = Template.instance();
		return tmpl.uploading.get();
	}
});

Template.fileUpload.events({
	'click [data-action="select-file"]'(ev) {
		$("#fileUpload input#cloudinary-upload[type=file]").trigger('click');
	}
});