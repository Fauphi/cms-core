/*
* @Author: philipp
* @Date:   2017-08-22 11:45:10
* @Last Modified by:   philipp
* @Last Modified time: 2017-10-23 15:21:05
*/

'use strict';

export const Schema = new SimpleSchema({
    name :  {
        type: String,
        label: "Name"
    },
    published :  {
        type: Boolean,
        label: "Published?"
    },
    collection :  {
        type: String,
        label: "Collection"
    },
    tmplVar : {
        type: String,
        label: "TMPL_VAR"
    },
    cmsPage :  {
        type: Boolean,
        label: "is CMS Page",
        defaultValue: true
    },
    hasTags: {
        type: Boolean,
        label: 'has Tags',
        defaultValue: false,
        optional: true
    },
    titleKeys : {
        type: [String],
        label: "Title Keys"
    },
    subTitleKeys : {
        type: [String],
        label: "Sub-Title Keys"
    },
    view : {
        type: String,
        label: "View",
        allowedValues: ['table', 'blocks'],
        autoform: {
            options: function() {
                return [{value: 'table', label: 'table'}, {value: 'blocks', label: 'blocks'}];
            }
        }
    },
    imageKey : {
        type: String,
        label: "Image Key (only needed when view is 'blocks')",
        optional: true
    },
    baseSchemaString: {
        type: String,
        label: "Base Schema String",
        optional: true,
        autoform: {
            type: 'ace',
            'data-ace-mode': 'json'
        }
    },
    langSchemaString: {
        type: String,
        label: "Language Schema String",
        optional: true,
        autoform: {
            type: 'ace',
            'data-ace-mode': 'json'
        }
    },
    langSchema: {
        type: Object,
        optional: true,
        blackbox: true,
        autoform: {
            omit :true
        }
    },
    baseSchema: {
        type: Object,
        optional: true,
        blackbox: true,
        autoform: {
            omit: true
        }
    }
});