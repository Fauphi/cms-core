/*
* @Author: philipp
* @Date:   2017-08-22 12:13:47
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 12:14:17
*/

import { Meteor } from 'meteor/meteor';

if(Meteor.isServer) {
	// publicationis
	Meteor.publish('all-user', function() {
		return Meteor.users.find({});
	});	

	//methods
}
