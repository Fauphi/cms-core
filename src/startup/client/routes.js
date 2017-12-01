/*
* @Author: Philipp
* @Date:   2016-10-05 16:35:36
* @Last Modified by:   philipp
* @Last Modified time: 2017-09-25 12:59:42
*/

'use strict';

// ONLY EDIT THIS FILE IN THE CORE!

import {FlowRouter} from 'meteor/kadira:flow-router';
import {BlazeLayout} from 'meteor/kadira:blaze-layout';
import {AccountsTemplates} from 'meteor/useraccounts:core';

// layouts
import '/imports/core/ui/layouts/basic/basic.js';
import '/imports/core/ui/layouts/accounts/accounts.js';

// pages
import '/imports/core/ui/pages/welcome/welcome.js';

import '/imports/core/ui/pages/signin/signin.js';

import '/imports/core/ui/pages/account/account.js';

import '/imports/core/ui/pages/help/help.js';

import '/imports/core/ui/pages/seo/seo.js';

import '/imports/core/ui/pages/translations/translations.js';
import '/imports/core/ui/pages/translations/editTranslations.js';

import '/imports/core/ui/pages/mediaManager/mediaManager.js';

import '/imports/core/ui/pages/collections/dynamicPages.js';
import '/imports/core/ui/pages/collections/editDynamicPage.js';
import '/imports/core/ui/pages/collectionPages/overview.js';
import '/imports/core/ui/pages/collectionPages/editDoc.js';

import '/imports/core/ui/pages/customPages/customPages.js';
import '/imports/core/ui/pages/customPages/createCustomPage.js';

import '/imports/core/ui/pages/sitemap/sitemap.js';

import '/imports/core/ui/pages/config/contactConfig.js';
import '/imports/core/ui/pages/config/embedsConfig.js';
import '/imports/core/ui/pages/config/legalConfig.js';

FlowRouter.route(['/'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'welcome'});
    },
    name: 'welcome'
});

FlowRouter.route(['/help'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'help'});
    },
    name: 'help'
});

FlowRouter.route(['/seo'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'seo'});
    },
    name: 'seo'
});

FlowRouter.route(['/account'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'core_account'});
    },
    name: 'core_account'
});

FlowRouter.route(['/translations'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'core_translations'});
    },
    name: 'core_translations'
});

FlowRouter.route(['/translations/:_name'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'core_editTranslations'});
    },
    name: 'core_editTranslations'
});

FlowRouter.route(['/media-manager'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'mediaManager'});
    },
    name: 'media-manager'
});

FlowRouter.route(['/landing-pages'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'customPages'});
    },
    name: 'landingPages'
});

FlowRouter.route(['/config/sitemap'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'sitemap'});
    },
    name: 'sitemap'
});

FlowRouter.route(['/config/contact'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'contactConfig'});
    },
    name: 'contactConfig'
});

FlowRouter.route(['/config/embeds'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'embedsConfig'});
    },
    name: 'embedsConfig'
});

FlowRouter.route(['/config/legal'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'legalConfig'});
    },
    name: 'legalConfig'
});

FlowRouter.route(['/dynamic-pages'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'sys_dynamicPages'});
    },
    name: 'sys_dynamicPages'
});

FlowRouter.route(['/dynamic-pages/:_id'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'editDynamicPage'});
    },
    name: 'editDynamicPage'
});

FlowRouter.route(['/pages/:_tmplVar'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'sys_pages'});
    },
    name: 'sys_pages'
});

FlowRouter.route(['/pages/:_tmplVar/:_id'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'sys_editPage'});
    },
    name: 'sys_editPage'
});

FlowRouter.route(['/custom'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'core_customPages'});
    },
    name: 'core_customPages'
});

FlowRouter.route(['/custom/:_id'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'createCustomPage'});
    },
    name: 'createCustomPage'
});

FlowRouter.route(['/custom/:_id/preview'], {
    action: function(params, queryParams) {
        BlazeLayout.render('App_body_no_header', {main: 'previewCustomPage'});
    },
    name: 'previewCustomPage'
});

FlowRouter.triggers.enter([AccountsTemplates.ensureSignedIn], {except: ["previewCustomPage"]});

AccountsTemplates.configureRoute('signIn', {
    layoutType: 'blaze',
    name: 'signin',
    path: '/login',
    template: 'signin',
    layoutTemplate: 'accounts-layout',
    contentRegion: 'main',
    redirect: '/'
});