/*
* @Author: philipp
* @Date:   2017-08-21 23:40:28
* @Last Modified by:   philipp
* @Last Modified time: 2017-09-06 15:24:19
*/

// ONLY EDIT THIS FILE IN THE CORE!

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';

import '/imports/core/api/account/account.js';
import '/imports/core/api/collectionPages/collectionPages.js';
import '/imports/core/api/collections/collections.js';
import '/imports/core/api/config/config.js';
import '/imports/core/api/customPages/customPages.js';
import '/imports/core/api/mediaManager/mediaManager.js';
import '/imports/core/api/people/people.js';
import '/imports/core/api/seo/seo.js';
import '/imports/core/api/sitemap/sitemap.js';
import '/imports/core/api/translations/translations.js';
import '/imports/core/api/users/users.js';

Meteor.startup(() => {

	// Cloudinary.config({
	// 	cloud_name: Meteor.settings.public.CLOUDINARY_CLOUD_NAME,
	// 	api_key: Meteor.settings.public.CLOUDINARY_API_KEY,
	// 	api_secret: Meteor.settings.CLOUDINARY_API_SECRET
	// });
	
	if(Meteor.settings.createAdminUser) {
		console.log('-- TRYING TO CREATE ADMIN USER ---');
		const userData = Meteor.settings.createAdminUser
		,	adminUser = Meteor.users.findOne({'emails.0.address': userData.email});

		if(!adminUser) {
			const userId = Accounts.createUser({
			    username: userData.firstname+' '+userData.lastname,
			    email: userData.email,
			    password: userData.password,
			    profile: {
			        firstname: userData.firstname,
			        lastname: userData.lastname,
			        position: 'developer',
			        location: userData.location,
			        profileImage: '/assets/img/defaultAvatar.png'
			    }
			});

			Roles.addUsersToRoles(userId, ['admin', 'webmaster']);
			console.log('-- ADMIN USER IS CREATED ---');
		} else {
			console.log('-- ADMIN USER ALREADY EXISTS ---');
		}
	}
	
});