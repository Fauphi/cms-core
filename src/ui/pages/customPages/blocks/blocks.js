/*
* @Author: philipp
* @Date:   2017-08-09 10:25:24
* @Last Modified by:   philipp
* @Last Modified time: 2017-10-11 11:19:40
*/

'use strict';

import { Template } from 'meteor/templating';
import { Utils } from '/imports/tools/Utils.js';

import { Blocks } from './../clientCollections.js';
import { People } from '/imports/core/api/people/people.js';

import { helpers as projectHelpers, events as projectEvents, templates as projectTemplates } from '/imports/ui/pages/customPages/blocks/blocks.js';

export const templates = ['asCmsText', 'asCmsImage', 'asCmsColumns', 'asCmsHero', 'asCmsBigTitle', 'asCmsPeople', 'asCmsSeparator'].concat(projectTemplates);

const coreHelpers = {
	formatDate(date) {
		return moment(date).format('DD.MM.YYYY');
	},
	getPeople(peopleId) {
		return People.findOne({_id: peopleId});
	},
	resizeImage(url, width) {
        if(url) {
        	const _width = width || '400';
            const split = url.split('upload/');
            return (split && split.length>1)?split[0]+'upload/w_'+_width+'/'+split[1]:url;
        }
    }
};

export const helpers = Utils.extend({}, coreHelpers, projectHelpers);
// export const events = Utils.extend({}, projectEvents);

if(Meteor.isClient) {
	import './blocks.html';
	import '/imports/ui/pages/customPages/blocks/blocks.html'; // project specific blocks

	for(let tmpl of templates) {

		Template[tmpl].helpers(helpers);

		Template[tmpl].events({
			// 'click [data-action="edit"]'(ev) {
			// 	const action = '[data-action="edit"]'
			// 	,	$editTarget = $(ev.target)
			// 	,	$editElm = ($editTarget.is(action))?$editTarget:$editTarget.parents(action);

			// 	// console.log('Edit: '+this.type+' -> '+$editElm.data('type'));
			// 	if($editElm.data('type')=='text') {
			// 		const innerHtml = $editElm.text()
			// 		,	$editor = $('<div/>');
					
			// 		$editor.addClass('editor')
			// 		$editor.attr('contenteditable', 'true');
			// 		$editor.html(innerHtml);

			// 		$editElm.attr('data-action', 'active-edit');
			// 		$editElm.html($editor);
			// 		$editor.focus();
			// 	} else if($editElm.data('type')=='image') {
			// 		Meteor.modal('#mediaManagerModal');
			// 	}
			// },
			// 'focusout [data-action="active-edit"]'(ev) {
			// 	const action = '[data-action="active-edit"]'
			// 	,	$editTarget = $(ev.target)
			// 	,	$editElm = ($editTarget.is(action))?$editTarget:$editTarget.parents(action);

			// 	// console.log('Save: '+this.type+' -> '+$editElm.data('type'));
			// 	if($editElm.data('type')=='text') {
			// 		const $editor = $editElm.find('.editor')
			// 		,	innerHtml = $editor.text();

			// 		$editElm.attr('data-action', 'edit');
			// 		$editor.remove();
					
			// 		Blocks.update({_id: this._id}, {$set: {'content.text': innerHtml}});
			// 		console.log(Blocks.findOne({_id: this._id}));
			// 	}
			// }
		});

	}
}