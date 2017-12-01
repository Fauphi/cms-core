/*
* @Author: philipp
* @Date:   2017-08-22 11:40:18
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 11:59:54
*/

'use strict';

export const Schema = new SimpleSchema({
    category: {
        type: String,
        label: "Category name",
        autoform: {
            options() {
                const categories = $.extend([], Meteor.settings.public.categories)
                ,   allIndex = categories.indexOf('all');
                if(allIndex>=0) categories.splice(categories.indexOf('all'), 1);
                return categories.map((el) => { return {label: el, value: el}; });
            }
        }
    },
    key: {
        type: String,
        label: "Translation key"
    },
    en: {
        type: String,
        label: "English translation",
        autoform: {
            type: 'textarea'
        }
    },
    de: {
        type: String,
        label: "German translation",
        autoform: {
            type: 'textarea'
        }
    },
    cn: {
        type: String,
        label: "Chinese translation",
        autoform: {
            type: 'textarea'
        }
    }
});