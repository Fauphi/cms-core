/*
* @Author: Philipp
* @Date:   2016-06-28 20:16:10
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 12:16:36
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Schema } from './schema.js';

export const SEO = new Mongo.Collection('seo');

SEO.attachSchema(Schema);

if(Meteor.isServer) {    
    // publications
    Meteor.publish('all-seo', () => {
        return SEO.find({});
    });

    // methods
    Meteor.methods({
        'seo.insert'(data) {
            SEO.insert(data);
        },
        'seo.update'(seoId, data) {
            SEO.update({_id: seoId}, {$set: data});
        },
        'seo.remove'(seoId) {
            SEO.remove(seoId);
        }
    });
}