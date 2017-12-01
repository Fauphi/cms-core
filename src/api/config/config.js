/*
* @Author: philipp
* @Date:   2017-07-05 17:03:49
* @Last Modified by:   philipp
* @Last Modified time: 2017-09-25 13:13:56
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Schema } from './schema.js';

export const Config = new Mongo.Collection('config');

Config.attachSchema(Schema);

if(Meteor.isServer) {
	// publications
	Meteor.publish('global-config', () => {
		return Config.find({type: 'global'});
	});

	Meteor.publish('callToAction-config', () => {
		return Config.find({type: 'callToAction'});
	});

	Meteor.publish('embeds-config', () => {
		return Config.find({type: 'embeds'});
	});

	Meteor.publish('legal-config', () => {
		return Config.find({type: 'legal'});
	});

	// methods
	Meteor.methods({
        'config.update'(id, data) {
        	Config.update({_id: id}, {$set: {data: data}});
        },
        'config.autoform-update'(data, id) {
        	Config.update({_id: id}, data);
        }
    });
}