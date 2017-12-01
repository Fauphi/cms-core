/*
* @Author: philipp
* @Date:   2017-08-22 11:39:03
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 11:39:25
*/

'use strict';

export const Schema = new SimpleSchema({
    name: {
    	type: String
    },
    label: {
    	type: String
    },
    url: {
    	type: String
    },
    active: {
    	type: Boolean
    },
    lang: {
    	type: String,
    	defaultValue: 'de',
    	allowedValues: ['de', 'en', 'cn']
    },
    sub: {
    	type: Boolean,
    	optional: true
    },
    parent: {
    	type: String,
    	optional: true,
    	allowedValues: ['services', 'career', 'company', 'news', 'knowledge']
    },
    index: {
    	type: Number,
    	optional: true
    }
});