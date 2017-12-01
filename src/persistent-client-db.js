/*
* @Author: Philipp
* @Date:   2016-10-06 16:01:56
* @Last Modified by:   philipp
* @Last Modified time: 2016-11-02 14:58:27
*/

// Local persisten DB (mostly for mobile apps):
// 
// Just use the collection normally and the observer
// will keep it sync'd to browser storage. the data will be stored
// back into the collection when returning to the app (depending,
// of course, on availability of localStorage in the browser).


// import {Meteor} from 'meteor/meteor';

// // create a local collection, 
// export const ShoppingCart = new Meteor.Collection('shopping-cart', {connection: null});

// // create a local persistence observer
// var shoppingCartObserver = new PersistentMinimongo(ShoppingCart);