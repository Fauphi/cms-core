/*
* @Author: philipp
* @Date:   2017-08-22 11:50:52
* @Last Modified by:   philipp
* @Last Modified time: 2017-11-02 14:33:44
*/

'use strict';

import { CleanString } from '/imports/tools/CleanString.js';
import { Utils } from '/imports/tools/Utils.js';

import { typeScheme } from '/imports/ui/pages/customPages/typeSchemes.js';

const basicScheme = {
    createdAt: {
        type: Number,
        autoValue: function() {
            if(this.isInsert) return new Date().getTime();
            else this.unset();
        },
        autoform: {
            omit: true
        }
    },
    'title': {
        label: 'Title',
        type: String
    },
    'mainImage': {
        label: 'Cover Image',
        type: String,
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'mediaManager'
            }
        }
    },
    slug: {
        label: 'Slug',
        type: String,
        autoValue: function() {
            if((this.isInsert) && this.field('title').value && this.field('type').value) {
                const createUrl = (parent, title) => {
                    let cleanTitle = CleanString.removeUmlaute(title.toLowerCase());
                    cleanTitle = CleanString.removeSpecialCharacters(cleanTitle);

                    return '/'+parent.toLowerCase()+'/'+cleanTitle;
                }
                return createUrl(this.field('type').value, this.field('title').value);
            } else if(this.isUpdate) {
                console.log('SLUG (before update): ', this.value);
                return this.value;
            } else this.unset();
        },
        autoform: {
            disabled: true
        }
    },
    author: {
        type: String,
        autoform: {
            omit: true
        }
    },
    type: {
        type: String,
        // allowedValues: ['custom', 'news', 'event', 'landing', 'blog'],
        defaultValue: 'custom',
        autoform: {
            type: 'hidden'
        }
    },
    published: {
        type: Boolean,
        defaultValue: false
    },
    publicPreview: {
        type: Boolean,
        defaultValue: false
    },
    languageId: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    language: {
        label: 'Language',
        type: String,
        allowedValues: Meteor.settings.public.availableLanguages,
        defaultValue: Meteor.settings.public.availableLanguages[0],
        autoform: {
            options: function() {
                const langs = Meteor.settings.public.availableLanguages;
                let array = [];

                for(let lang of langs) {
                    array.push({label: lang, value: lang});
                }
                
                return array;
            }
        }
    },
    'contents': {
        type: [Object],
        blackbox: true,
        defaultValue: [],
        autoform: {
            omit: true
        }
    },
    'breadcrumbs': {
        type: [Object],
        blackbox: true,
        optional: true,
        autoform: {
            omit: true
        }
    },
    attachements: {
        type: [Object],
        optional: true,
        blackbox: true,
        autoform: {
            omit: true
        }
    },
    renderedHtml: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    socialMedia: {
        type: Object,
        optional: true,
        blackbox: true
    }
};

const finalScheme = Utils.extend({}, basicScheme, typeScheme);

export const Schema = new SimpleSchema(finalScheme);