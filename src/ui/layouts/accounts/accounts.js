/*
* @Author: Philipp
* @Date:   2017-01-31 14:15:22
* @Last Modified by:   philipp
* @Last Modified time: 2017-07-27 16:35:28
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './accounts.html';

Template['accounts-layout'].helpers({
	companyName() {
		return Meteor.settings.public.companyName;
	}
});