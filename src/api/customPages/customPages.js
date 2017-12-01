/*
* @Author: Philipp
* @Date:   2016-06-28 20:16:10
* @Last Modified by:   philipp
* @Last Modified time: 2017-11-30 12:56:05
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SSR } from 'meteor/meteorhacks:ssr';
import { HTTP } from 'meteor/http';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';

import { ProjectCustomPages } from '/imports/api/customPages/customPages.js';

import { Utils } from '/imports/tools/Utils.js';
import { People } from '/imports/core/api/people/people.js';
import { Sitemap } from '/imports/core/api/sitemap/sitemap.js';
import { Schema } from './schema.js';
import { CleanString } from '/imports/tools/CleanString.js';
import { templates as blockTemplates, helpers as blockHelpers } from '/imports/core/ui/pages/customPages/blocks/blocks.js';
import { templates as projectBlockTemplates, helpers as projectBlockHelpers } from '/imports/ui/pages/customPages/blocks/blocks.js';

export const CustomPages = new Mongo.Collection('customPages');
const CustomPagesOrg = new Mongo.Collection('customPagesOrg');
CustomPages.attachSchema(Schema);

// helper functions
const createUrl = (parent, title) => {
    let cleanTitle = CleanString.removeUmlaute(title.toLowerCase());
    cleanTitle = CleanString.removeSpecialCharacters(cleanTitle);

    return '/'+parent.toLowerCase()+'/'+cleanTitle;
}

const validateUrl = (url)=>{
    const exists1 = Sitemap.findOne({url: url})
    ,   exists2 = CustomPages.findOne({slug: url});

    const validRegEx = /^\/([a-zA-Z0-9-])+(\/[a-zA-Z0-9-]+)*$/.test(url);

    return /\S/.test(url) && (!!!exists1 && !!!exists2) && validRegEx;
}

const renderPage = (id) => {
    const SERVER_CUSTOM_PAGE = CustomPages.findOne({_id: id});
    
    for(let block of blockTemplates) {
        const tmpl = SSR.compileTemplate(block, Assets.getText('core/blocks/'+block+'.html'));
        tmpl.SERVER_CUSTOM_PAGE = SERVER_CUSTOM_PAGE;
        tmpl.helpers(blockHelpers);
    }

    for(let block of projectBlockTemplates) {
        const tmpl = SSR.compileTemplate(block, Assets.getText('core/blocks/'+block+'.html'));
        tmpl.SERVER_CUSTOM_PAGE = SERVER_CUSTOM_PAGE;
        tmpl.helpers(projectBlockHelpers);
        tmpl.helpers(blockHelpers);
    }

    const tmpl = SSR.compileTemplate('previewCustomPage', Assets.getText('core/previewCustomPage.html'));

    tmpl.helpers({
        getContentColl() {
            return SERVER_CUSTOM_PAGE.contents.sort((a,b)=>{
                if(a.index>b.index) return 1;
                else if(a.index<b.index) return -1;
                else return 0;
            });
        },
        resizeImage(url, width) {
            if(url) {
                const split = url.split('upload/');
                return (split && split.length>1)?split[0]+'upload/w_'+width+'/'+split[1]:url;
            }
        },
        getBlockData() {
            return {block: this, page: SERVER_CUSTOM_PAGE};
        },
        isLastBlock(index) {
            const blockCount = SERVER_CUSTOM_PAGE.contents.length;
            return (index==(blockCount-1));
        },
        isFirstBlock(index) {
            return (index==0);
        }
    });

    var html = SSR.render("previewCustomPage", SERVER_CUSTOM_PAGE);
    
    const page = CustomPages.findOne({_id: id});
    delete page._id;
    page.renderedHtml = html;
    CustomPages.update({_id: id}, {$set: page});
}

if(Meteor.isServer) {
    // publications
    Meteor.publish('page-customPages', (id) => {
        return CustomPages.find({});
    });

    // publications
    Meteor.publish('customPages-type', (type) => {
        return CustomPages.find({type: type});
    });

    Meteor.publish('single-custom-pages', (id) => {
        const current = CustomPages.findOne({_id: id});
        if(current) {
            return [
                CustomPages.find({languageId: current.languageId}),
                People.find({})
            ];
        }
    });

    Meteor.publish("grouped-custom-pages", function () {
        ReactiveAggregate(this, CustomPages, [{
            $group: {
                _id: "$languageId",
                createdAt: {$push: "$createdAt"},
                pages: { $push: {title: "$title", id: "$_id", language: "$language", type: "$type", published: "$published", mainImage: "$mainImage" }}
            }
        }], { clientCollection: "GroupedCustomPages" });
    });

    // methods
    Meteor.methods({
        'customPages.refactor'() {
            console.log('REFACTOR');
        },
        'blocks.update'() {
            // DUMMY METHOD FOR CLIENT AUTOFORM BLOCK UPDATE
        },
        'customPages.pageCount'(data) {
            if(Meteor.userId()) {
                return CustomPages.find({}).count();
            }
        },
        'customPages.create'(data) {
            if(Meteor.userId() && Roles.userIsInRole(Meteor.user(), ['author', 'admin'])) {
                const languageId = Utils.uuid();

                for(let language of data.languages) {
                    const pageData = {
                        title: data.title,
                        language: language,
                        languageId: languageId,
                        type: data.type,
                        mainImage: '/assets/img/image-placeholder-dark.jpg',
                        author: Meteor.userId(),
                        contents: [],
                        renderedHtml: ''
                    };

                    pageData = ProjectCustomPages.addContent(pageData);

                    return CustomPages.insert(pageData);
                }  
            }
        },
        'customPages.createLanguageVersion'(customPageId, language) {
            if(Meteor.userId()) {
                const customPage = CustomPages.findOne({_id: customPageId}); 

                delete customPage._id;
                customPage.contents = [];
                customPage.language = language;
                customPage.renderedHtml = "";
                customPage.published = false;
                customPage.publicReview = false;

                CustomPages.insert(customPage);
            }
        },
        'customPages.delete'(id) {
            if(Meteor.userId() && Roles.userIsInRole(Meteor.user(), ['author', 'admin'])) {
                CustomPages.remove({_id: id});
            }
        },
        'customPages.deleteAllPageVersions'(languageId) {
            if(Meteor.userId() && Roles.userIsInRole(Meteor.user(), ['author', 'admin'])) {
                CustomPages.remove({languageId: languageId}, {multi: true});
            }
        },
        'customPages.update'(data, customPageId) {
            if(Meteor.userId() && data && customPageId) {
                console.log('Update: ', data);
                if(data) CustomPages.update({_id: customPageId}, data);
                // this.unblock();

                // render page
                // renderPage(customPageId);
            }
        },
        'customPages.updateContents'(customPageId, data) {
            if(Meteor.userId() && customPageId && data) {
                console.log('Update Contents: ', data);
                if(data) CustomPages.update({_id: customPageId}, {$set: {contents: data}});
                this.unblock();

                // render page
                renderPage(customPageId);
            }
        },
        'customPages.getCount'(route) {
            if(Meteor.userId()) {
                if(route!='customPages') return CustomPages.find({parent: route}, {sort: {createdAt: -1}}).count();
                else return CustomPages.find({parent: {$not: /news/ig}}, {sort: {createdAt: -1}}).count();
            }
        },
        'customPages.validateUrl'(url) {
            if(Meteor.userId()) {
                return validateUrl(url);
            }
        },
        'customPages.updateUrl'(customPageId, url) {
            if(Meteor.userId()) {
                if(validateUrl(url)) {
                    const current = CustomPages.findOne({_id: customPageId})
                    ,   allPages = CustomPages.find({languageId: current.languageId}).fetch();

                    for(let page of allPages) {
                        CustomPages.update({_id: page._id}, {$set: {slug: url}});
                    }
                }
            }
        }
    });
}