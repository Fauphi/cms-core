/*
* @Author: Philipp
* @Date:   2016-06-28 20:16:10
* @Last Modified by:   philipp
* @Last Modified time: 2017-10-20 15:43:24
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Schema } from './schema.js';

const https = require('https')
,   fs = require('fs')
,   sanitizeHtml = require('sanitize-html');

export const Translations = new Mongo.Collection('translations');

Translations.attachSchema(Schema);

if(Meteor.isServer) {    
    import { Media } from '/imports/core/api/mediaManager/mediaManager.js';

    // publications
    Meteor.publish('all-translations', () => {
        return Translations.find({});
    });

    // methods
    Meteor.methods({
        'translations.refactor'() {
            const all = Translations.find({}).fetch();

            for(let item of all) {
                try {
                    console.log(item._id);
                    Translations.update({_id: item._id}, {$set: {cn: item.en || ''}});
                } catch(e) {
                    console.log(e);
                }
                
            }
        },
        'translations.insert'(data) {
            Translations.insert(data, {removeEmptyStrings: false});
        },
        'translations.update'(translationsId, data) {
            console.log(arguments);
            delete data._id;

            // Allow only a super restricted set of tags and attributes 
            let cleanData = {};
            const options = {
                allowedTags: [ 'p', 'a', 'br', 'ul', 'li' ],
                allowedAttributes: {
                    'a': [ 'href' ]
                },
                transformTags: {
                    'p': 'br',
                }
            };

            cleanData.en = sanitizeHtml(data.en, options).replace(/(^<br\s\/>)/g, '').replace(/(<br>(<br>)+)/g, '<br /><br />').replace(/(<br\s\/>(<br\s\/>)+)/g, '<br /><br />');
            cleanData.de = sanitizeHtml(data.de, options).replace(/(^<br\s\/>)/g, '').replace(/(<br>(<br>)+)/g, '<br /><br />').replace(/(<br\s\/>(<br\s\/>)+)/g, '<br /><br />');
            cleanData.cn = sanitizeHtml(data.cn, options).replace(/(^<br\s\/>)/g, '').replace(/(<br>(<br>)+)/g, '<br /><br />').replace(/(<br\s\/>(<br\s\/>)+)/g, '<br /><br />');

            Translations.update({_id: translationsId}, {$set: cleanData}, {removeEmptyStrings: false});
        },
        'translations.remove'(translationsId) {
            // add to history
            const oldValue = Translations.findOne({_id: translationsId})
            ,   change = 'deleted Label <b>'+oldValue.key+' ('+oldValue.en+' / '+oldValue.de+')</b> in <b>'+oldValue.category+'</b>';
            Meteor.call('history.add', change, translationsId, {});

            Translations.remove(translationsId);
        },
        'translations.deleteImage'(cloudinaryId) {
            console.log('delete: ', cloudinaryId);
            const path = '/v1_1/do8gcokmo/resources/image/upload?public_ids[]='+cloudinaryId
            ,   auth = 'Basic ' + new Buffer(Meteor.settings.public.CLOUDINARY_API_KEY + ':' + Meteor.settings.CLOUDINARY_API_SECRET).toString('base64');

            var options = {
                host: 'api.cloudinary.com',
                path: path,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth
                }
            };

            var req = https.request(options);

            req.on('error', (e) => {
                console.error('DELETING CLOUDINARY IMAGE FAILED: ', e);
            });

            req.end();
        },
        'translations.getHtml'(name) {
            if(name=='headerImages') return Assets.getText('headerImages.handlebars');
            else return Assets.getText('clientViews/'+name+'.handlebars');
        },
        'translations.getFiles'() {
            this.unblock();
            const privateFolderPath = process.cwd() + '/assets/app'
            ,   testFolder = privateFolderPath+'/clientViews/'
            ,   files = fs.readdirSync(testFolder)
            ,   fileList = [];

            if(files) {
                try {
                    files.forEach(file => {
                        if(file.match('.handlebars')) fileList.push(file.replace('.handlebars', ''));
                        else if(!file.match(/(DS_Store)|(layouts)/)) {
                            const subFolder = fs.readdirSync(testFolder+'/'+file);
                            subFolder.forEach(subFile => {
                                if(subFile.match('.handlebars')) fileList.push(file+'/'+subFile.replace('.handlebars', ''));    
                                else if(!subFile.match(/(DS_Store)|(layouts)/)) {
                                    const subSubFolder = fs.readdirSync(testFolder+file+'/'+subFile);
                                    subSubFolder.forEach(subSubFile => {
                                        if(subSubFile.match('.handlebars')) fileList.push(file+'/'+subFile+'/'+subSubFile.replace('.handlebars', ''));    
                                    });
                                }
                            });
                        }
                    });
                } catch(e) {
                    console.log(e);
                }
            }
            return fileList;
        },
    });
}