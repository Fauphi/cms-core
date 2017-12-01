/*
* @Author: Philipp
* @Date:   2017-02-07 11:11:11
* @Last Modified by:   philipp
* @Last Modified time: 2017-11-06 09:35:39
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';

import '/imports/core/ui/components/langContainer/langContainer.js';

import './translations.html';

const TMPL_NAME = 'core_translations';

const fileExceptions = ['custom']
,	folderExceptions = ['partials'];

Template[TMPL_NAME].onCreated(function() {
	const that = this;

	that.lang = new ReactiveVar('de');
	that.templateFiles = new ReactiveVar();

	Meteor.call('translations.getFiles', (err, res) => {
		that.templateFiles.set(res);
	});

	that.autorun(() => {
		// get selected language from component
		const lang = Session.get('langContainerSelectedLang') || 'de';
		that.lang.set(lang);
	});
});

Template[TMPL_NAME].helpers({
	formatName(name) {
		const split = name.split(/(?=[A-Z])/);
		return (split)?split.join(' '):name;
	},
	templateFiles() {
		const tmpl = Template.instance()
		,	cleanedUpFiles = [{key: 'base', files: []}];

		if(tmpl) {
			const files = tmpl.templateFiles.get() || [];

			for(let item of files) {
				const split = item.split('/')
				,	key = (split.length>1)?split[0]:'base'
				,	name = (split.length>2)?split[2]:((split.length>1)?split[1]: item)
				,	found = null;

				for(let itemKey of cleanedUpFiles) {
					if(itemKey.key==key) {
						found = itemKey;
						break;
					}
				}

				const fileObj = {key: item, name: name};

				// Use all template files except the one in the partials-folder and the customPage template
				if(fileExceptions.indexOf(name)==-1 && folderExceptions.indexOf(key)==-1) {
					if(found) found.files.push(fileObj);
					else cleanedUpFiles.push({key: key, files: [fileObj]});	
				}
			}

		}

		const removeTemplateFiles = Meteor.settings.public.removeTemplateFiles;
		// remove files
		for(let item of cleanedUpFiles) {
			for(let i=0;i<item.files.length;i++) {
				const file = item.files[i];				
				if(removeTemplateFiles.indexOf(file.name)>-1) {
					item.files.splice(i,1);
					i--;
				}
			}
		}

		return cleanedUpFiles;
	}
});

Template[TMPL_NAME].events({
	'click [data-action="change-tmpl"]'(ev, tmpl) {
		const $elm = $(ev.target);
		FlowRouter.go('/translations/'+this.key.replace('/', '-'));
	}
});