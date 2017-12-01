/*
* @Author: philipp
* @Date:   2017-08-22 11:16:30
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 11:19:11
*/

'use strict';

export const Schema = new SimpleSchema({
    createdAt: {
		type: Number,
		autoValue: function() {
			if(this.isInsert) return new Date().getTime();
			else this.unset();
		},
        optional: true,
        autoform: {
            omit: true
        }
	},
	url: {
		type: String
	},
	type: {
		type: String,
		allowedValues: ['image', 'video']
	},
	creator: {
		type: String
	},
	cloudinary: {
		type: Object,
		blackbox: true
	}
});