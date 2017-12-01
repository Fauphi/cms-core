/*
* @Author: philipp
* @Date:   2017-08-22 11:58:42
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 11:59:48
*/

'use strict';

export const Schema = new SimpleSchema({
    category: {
        type: String,
        label: "Page name",
        autoform: {
            options() {
                const categories = $.extend([], Meteor.settings.public.seo) 
                ,   allIndex = categories.indexOf('all');
                if(allIndex>=0) categories.splice(categories.indexOf('all'), 1);
                return categories.map((el) => { return {label: el, value: el}; });
            }
        }
    },
    key: {
        type: String,
        label: "Meta-Tag name",
        autoform: {
            options() {
                const tagNames = $.extend([], Meteor.settings.public.seoTagNames) 
                ,   allIndex = tagNames.indexOf('all');

                if(allIndex>=0) tagNames.splice(tagNames.indexOf('all'), 1);
                return tagNames.map((el) => { return {label: el, value: el}; });
            }
        }
    },
    en: {
        type: String,
        label: "English translation",
        optional: true,
        autoform: {
            type: 'textarea'
        }
    },
    de: {
        type: String,
        label: "German translation",
        optional: true,
        autoform: {
            type: 'textarea'
        }
    }
});