/*
* @Author: Philipp
* @Date:   2016-06-28 20:16:10
* @Last Modified by:   philipp
* @Last Modified time: 2017-12-01 15:59:01
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';

import { UpdateSchema as _UpdateSchema, SignUpSchema as _SignUpSchema } from './schema.js';

export const UpdateSchema = _UpdateSchema;
export const SignUpSchema = _SignUpSchema;

if(Meteor.isServer) {
    // publications
    Meteor.publish('all-users', () => {
        if(Meteor.userId()) return Meteor.users.find({});
    });
    
    // methods
    Meteor.methods({
        'account.update'(data) {
            console.log(data);
        	if(Meteor.user() && data) {
        		const profile = Meteor.user().profile
                ,   newData = data;
                
                for(let key in newData) {
                    profile[key] = newData[key];
                }

                if(!newData.profileImage) profile.profileImage = "";

        		Meteor.users.update({_id: Meteor.userId()}, {$set: {profile: profile}});
        	}
        },
        'account.create'(data) {
            if(Roles.userIsInRole(Meteor.user(), 'admin') && data) {
                Accounts.createUser({
                    username: data.firstname+' '+data.lastname,
                    email: data.email,
                    roles: [],
                    profile: {
                        firstname: data.firstname,
                        lastname: data.lastname,
                        position: data.position,
                        location: data.location,
                        profileImage: data.profileImage || 'http://res.cloudinary.com/do8gcokmo/image/upload/v1487848979/default-avatar-2_ofaije.png'
                    }
                });
            }
        },
        'account.changeRole'(role, userId, basicRoleChange=false) {
            if(Roles.userIsInRole(Meteor.user(), 'admin') && role && userId) {
                if(basicRoleChange) Roles.removeUsersFromRoles(userId, ['editor', 'author', 'admin']);

                if(Roles.userIsInRole(userId, role)) Roles.removeUsersFromRoles(userId, role);
                else Roles.addUsersToRoles(userId, role);
            }
        },
        'account.saveProfileImage'() {
            console.log('Add '+response.upload_data+' to the id of '+response.context);
        }
    });
}