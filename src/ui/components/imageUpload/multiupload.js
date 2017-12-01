/*
* @Author: Philipp
* @Date:   2017-04-05 16:20:36
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 12:06:46
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Media } from '/imports/core/api/mediaManager/mediaManager.js';

import './multiupload.html';

Template.multiupload.onRendered(function() {
	var	cloudinaryData
	,	dropzone;

	$('#drop_overlay').remove();

	Meteor.call('mediaManager.cloudinaryTokenForDropzone', function(err,data) {
		cloudinaryData = data;

		// check if dropzone is already attached to document.body
		try {
			dropzone = Dropzone.forElement(document.body);
			dropzone.destroy();
		} catch(e) {
			// do nothing	
		}

		Meteor.initDragDrop();

		// Dropzone config and events
		var customOptions = {
			// maxFilesize: Meteor.settings.public.mediaUpload.maxImageSize, // @TODO: does not work
			parallelUploads: 1,
			maxFiles: 20,
			url: 'https://api.cloudinary.com/v1_1/'+Meteor.settings.public.CLOUDINARY_CLOUD_NAME+'/image/upload',
			previewsContainer: '#preview-upload',
			autoProcessQueue: true,
			// resize: ?? // @TODO: check this
			// clickable: '.uploadBtn' // @TODO: for mobile
			// previewTemplate: ?? // @TODO: custom view for upload box
		}
		,	options = _.extend( {}, Meteor.Dropzone.options, customOptions);

		dropzone = new Dropzone(document.body, options);

		initDropzoneHandler(dropzone, cloudinaryData);
	});

});

Template.multiupload.events({
	'click [data-action="upload-file"]': function(ev) {
		ev.preventDefault();
		var dropzone = Dropzone.forElement(document.body);
		dropzone.hiddenFileInput.click();
	}
})

/**
 * @description: Adds all needed handlers to the dropzone element
 */
var initDropzoneHandler = function(dropzone, cloudinaryData) {
	var hideUploadPreview;

	// @TODO: validation should be done in the "accept" event, but its not triggering
    dropzone.on('addedfiles', function(files, done) {
    	var sizeError = false
    	,	typeError = false
    	,	deletedCount = 0;

    	// validate files
    	for(var i=files.length;i--;) {
    		var item = files[i];
    		if(!item.type.match(/(\.|\/)(gif|jpe?g|png)$/i)) {
    			typeError = true;
    			deletedCount++;
    			dropzone.removeFile(item);
    		}
    		if(item.size>Meteor.settings.public.mediaUpload.maxImageSize) {
    			sizeError = true;
    			deletedCount++;
    			dropzone.removeFile(item);
    		}
    	}

    	// @TODO: error messsage for size error.
    	if(typeError) alert(deletedCount+" files were blocked.");
    	if(sizeError) alert(deletedCount+" files were blocked.");

    	if(files.length>deletedCount) {
    		$('#preview-upload').show();
    	} else {
    		console.log('remove all files');
    		dropzone.removeAllFiles(true); // @TODO: somehow only works with 'file dialog', but not when files get dropped...
    	}

    	$('#drop_overlay').remove();
    });

    dropzone.on('queuecomplete', function() {
    	$('#preview-upload').append('<div class="finished-label">FINISHED</div>');
    	hideUploadPreview = setTimeout(function() {
    		dropzone.removeAllFiles();
    		$('#preview-upload').hide();
    		$('#preview-upload').children('.finished-label').remove();
    	}, 1000);
    });

    // upload is finished successful
    dropzone.on('success', function(file, response) {
    	var cloudinaryData = response;
		Meteor.call('mediaManager.add', {url: cloudinaryData.secure_url, type: 'image', cloudinary: cloudinaryData});
    });

    dropzone.on('processing', function(file) {
    	clearTimeout(hideUploadPreview);
    	$('#preview-upload').children('.finished-label').remove();
    });

    // add cloudinary params to request
	dropzone.on("sending", function(file, xhr, data) {
		data.append("api_key", Meteor.settings.public.CLOUDINARY_ACTIVE_API_KEY);
		data.append("timestamp", cloudinaryData.timestamp);
		data.append("signature", cloudinaryData.sig);
	});
}
