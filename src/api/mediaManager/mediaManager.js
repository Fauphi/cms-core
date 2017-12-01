/*
* @Author: Philipp
* @Date:   2016-06-28 20:16:10
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 11:19:41
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';
import { HTTP } from 'meteor/http';

import { Schema } from './schema.js';

const https = require('https')
,	cloudinary = require('cloudinary');

export const Media = new Mongo.Collection('media');

// schema
Media.attachSchema(Schema);

if(Meteor.isServer) {

    // publications
    Meteor.publish('all-media', () => {
		return Media.find({});
	});

	Meteor.publish('limit-media', (limit=10) => {
		return Media.find({}, {sort: {createdAt: -1}, limit: limit});
	});

	Meteor.publish("aggregated-media", function () {
	  	ReactiveAggregate(this, Media, [{
	    	$group: {
				_id: "$creator",
				media: { $push: "$_id" }
	    	}
	  	}], { clientCollection: "clientAggregatedMedia" });
	});

	// methos
    Meteor.methods({
    	'upload_callback': function() {
			console.log('callback server');
		},
		'mediaManager.cloudinaryToken'() {
			const callback = "https://www.example.com/cloudinary_cors.html"
			,	timestamp = new Date().getTime();

			let serialized_params
			, 	sha1hex_digest;

			serialized_params = {timestamp: timestamp, callback: callback};

			sha1hex_digest = cloudinary.utils.api_sign_request(serialized_params, Meteor.settings.CLOUDINARY_API_SECRET);

			return {token: sha1hex_digest, timestamp: timestamp};
		},
		'mediaManager.cloudinaryTokenForDropzone': function() {
	        var timestamp = new Date().getTime()
	        ,   sig = cloudinary.utils.api_sign_request({timestamp: timestamp}, Meteor.settings.CLOUDINARY_API_SECRET);
	        
	        return {sig: sig, timestamp: timestamp};       
	    },
        'mediaManager.add'(data) {
            data['creator'] = Meteor.userId();

            // @TODO: add validation

            return Media.insert(data);
        },
        'mediaManager.delete'(mediaId) {
        	this.unblock();
			const media = Media.findOne({_id: mediaId});

			if(media && media.cloudinary) {
				const cloudinaryId = media.cloudinary.public_id
	            ,	path = '/v1_1/'+Meteor.settings.public.CLOUDINARY_CLOUD_NAME+'/resources/image/upload?public_ids[]='+cloudinaryId
	            ,   auth = 'Basic ' + new Buffer(Meteor.settings.public.CLOUDINARY_API_KEY + ':' + Meteor.settings.CLOUDINARY_API_SECRET).toString('base64');

	            var options = {
	                host: 'api.cloudinary.com',
	                path: path,
	                method: 'DELETE',
	                headers: {
	                    'Content-Type': 'application/json',
	                    'Authorization': auth
	                }
	            };

	            let result;

	            try {
		            const deleteRequest = Meteor.wrapAsync(HTTP.call);
		           	result = deleteRequest("DELETE", 'https://'+options.host+options.path, {headers: options.headers});
	            } catch(e) {
	            	console.error('DELETING CLOUDINARY IMAGE FAILED: ', e);
	            }

	            if(result && result.statusCode==200) {
	            	Media.remove({_id: media._id});	
	            }
            }
        }
    });
}