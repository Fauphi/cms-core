/*
* @Author: philipp
* @Date:   2017-08-22 11:37:59
* @Last Modified by:   philipp
* @Last Modified time: 2017-09-25 13:10:45
*/

'use strict';

export const Schema = new SimpleSchema({
	type: {
		type: String
	},
	data: {
		type: Object,
		blackbox: true
	},
	'data.imprint': {
		type: Object,
		label: "Imprint",
		optional: true
	},
	'data.imprint.de': {
		type: String,
		label: "Deutsch",
		optional: true,
		autoform: {
            afFieldInput: {
                type: 'quilleditor'
            }
        }
	},
	'data.imprint.en': {
		type: String,
		label: "English",
		optional: true,
		autoform: {
            afFieldInput: {
                type: 'quilleditor'
            }
        }
	},
	'data.privacy': {
		type: Object,
		label: "Privacy",
		optional: true
	},
	'data.privacy.de': {
		type: String,
		label: "Deutsch",
		optional: true,
		autoform: {
            afFieldInput: {
                type: 'quilleditor'
            }
        }
	},
	'data.privacy.en': {
		type: String,
		label: "English",
		optional: true,
		autoform: {
            afFieldInput: {
                type: 'quilleditor'
            }
        }
	}
});