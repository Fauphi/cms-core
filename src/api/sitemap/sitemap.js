/*
* @Author: philipp
* @Date:   2017-07-04 16:55:08
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 11:39:46
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Schema } from './schema.js';

export const Sitemap = new Mongo.Collection('sitemap');

Sitemap.attachSchema(Schema);

if(Meteor.isServer) {
    // publications
	Meteor.publish('sitemap', () => {
		return Sitemap.find({});
	});

    // methods
	Meteor.methods({
        'sitemap.update'(id) {
        	const stringId = new Mongo.ObjectID(id.valueOf())
        	,	site = Sitemap.findOne({_id: stringId});

        	if(site) Sitemap.update({_id: stringId}, {$set: {active: !site.active}});
        }
    });
}