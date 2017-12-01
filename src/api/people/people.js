/*
* @Author: philipp
* @Date:   2017-08-22 11:55:57
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 11:56:11
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const People = new Mongo.Collection('people');