/*
* @Author: Philipp
* @Date:   2017-06-08 17:08:40
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 13:36:49
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { CleanString } from '/imports/tools/CleanString.js';

import { Schema } from './schema.js';

export const TMPL_COLL = new Mongo.Collection('sys_pages');
export const TMPL_VAR = 'collections';
export const TMPL_SCHEMA = Schema;

TMPL_COLL.attachSchema(Schema);

const objSchema = (stringSchema) => {
    const json = JSON.parse(stringSchema.replace(/(\r\n|\r|\n|\t)/gi, '').replace(/\s\s+/g, ' '));
    return json;
}

if(Meteor.isServer) {
    Meteor.publish('all-'+TMPL_VAR, () => {
		return TMPL_COLL.find({}, {sort: {index: 1}});
	});

    Meteor.publish('page-'+TMPL_VAR, (pageCount, currentPage) => {
        return TMPL_COLL.find({}, {sort: {index: 1}});
    });

    Meteor.methods({
        [TMPL_VAR+'.pageCount']() {
            if(Meteor.userId()) {
                return TMPL_COLL.find({}).count();
            }
        },
        [TMPL_VAR+'.create'](data) {
            if(Meteor.userId()) {
                if(data.baseSchemaString) {
                    data.baseSchema = objSchema(data.baseSchemaString);
                }
                if(data.langSchemaString) {
                    data.langSchema = objSchema(data.langSchemaString);
                }
                TMPL_COLL.insert(data);
                Meteor.call('collectionPages.init');
            }
        },
        [TMPL_VAR+'.delete'](id) {
            if(Meteor.userId()) {
                TMPL_COLL.remove({_id: id}, {multiple: true});
            }
        },
        [TMPL_VAR+'.update'](data, id) {
            if(Meteor.userId()) {
                if(data['$set'].baseSchemaString) {
                    data['$set'].baseSchema = objSchema(data['$set'].baseSchemaString);
                }
                if(data['$set'].langSchemaString) {
                    data['$set'].langSchema = objSchema(data['$set'].langSchemaString);
                }
                TMPL_COLL.update(id, data);
                Meteor.call('collectionPages.init');
            }
        },
        [TMPL_VAR+'.updateOrder'](list) {
            if(Meteor.userId()) {
                for(let item of list) {
                    TMPL_COLL.update({_id: item._id}, {$set: {index: item.index}}, {multi: true});
                }
            }   
        }
    });
}