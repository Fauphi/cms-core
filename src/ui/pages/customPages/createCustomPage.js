/*
* @Author: Philipp
* @Date:   2017-02-13 14:35:19
* @Last Modified by:   philipp
* @Last Modified time: 2017-10-27 10:32:59
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import { People } from '/imports/core/api/people/people.js';

import { CustomPages } from '/imports/core/api/customPages/customPages.js';
import { Blocks, blockSchemes } from './clientCollections.js';

import './createCustomPage.html';
import './previewCustomPage.html';
import './blocks/blocks.js';
import './modals/editPageSettings.js';

import '/imports/core/ui/layouts/basic/basic.js';
import '/imports/ui/pages/customPages/blocks/blocks.js';

const templates = ['createCustomPage', 'previewCustomPage'];

for(let tmpl of templates) {
	Template[tmpl].onCreated(function created() {
		const that = this
		,	pageId = FlowRouter.getParam('_id') || '22FYQd8tGZjG3WpFL123';

		that.pageId = new ReactiveVar(pageId);

		// subs
		if(tmpl!='previewCustomPage') that.subscribe('all-users');
		// that.subscribe('all-icu_downloads');
		that.subscribe('single-custom-pages', pageId, ()=>{
			try {
				const pageData = CustomPages.findOne({_id: pageId})
				,	blocks = Blocks.find({}).fetch();

				if(tmpl=='previewCustomPage') {
					// check for public preview
					if(!pageData.publicPreview && !Meteor.userId()) FlowRouter.go('/login');
				}

				for(let block of blocks) {
					Blocks.remove({_id: block._id});
				}

				for(let content of pageData.contents) {
					Blocks.insert(content);
				}

				Session.set('customPageLanguage', pageData.language);
			} catch(e) {
				console.log(e);
			}
		});
	});

	Template[tmpl].helpers({
		getPage() {
			const tmpl = Template.instance()
			,	pageId = tmpl.pageId.get();

			// console.log(CustomPages.findOne({_id: pageId}).renderedHtml);

			return pageId && CustomPages.findOne({_id: pageId});
		},
		// getDownloads() {
		// 	let coll = Mongo.Collection.get('cms_downloads');
		// 	if(!coll) coll = new Mongo.Collection('cms_downloads');

		// 	console.log(coll.find({}).fetch());

		// 	return coll.find({});
		// },
		appendToDiv() {
			// console.log(this.renderedHtml);
			const that = this;
			setTimeout(function() {
				console.log($('#previewCustomPage #wrapper'));
				console.log(that);
				$('#previewCustomPage #wrapper').html(that.renderedHtml);
			}, 400);
		},
		getPageSchema() {
			return CustomPages.simpleSchema();
		},
		getContentColl() {
			return Blocks.find({}, {sort: {index: 1}});
		},
		resizeImage(url, width) {
			if(url) {
				const split = url.split('upload/');
				return split && split[0]+'upload/w_'+width+'/'+split[1];	
			}
		},
		asCmsTemplates() {
			const templates = Meteor.settings.public.blockTemplates;
			return templates;
		},
		languageVersions() {
			const pageId = FlowRouter.getParam('_id')
			,	current = CustomPages.findOne({_id: pageId})
			,	versions = (current)?CustomPages.find({languageId: current.languageId}).fetch():[]
			,	labels = Meteor.settings.public.languageLables
			,	langs = [];

			for(let version of versions) {
				langs.push({label: labels[version.language], value: version.language, _id: version._id});
			}

			return langs;
		},
		activeLanguage(lang) {
			const pageId = FlowRouter.getParam('_id')
			,	current = CustomPages.findOne({_id: pageId});
			return current && (lang==current.language);
		},
		getBlockSchema() {
			const type = Session.get('editBlockType');
			return blockSchemes[type];
		},
		getBlockDoc() {
			const id = Session.get('editBlockId');
			return Blocks.findOne({_id: id});
		},
		getBlockData() {
			const tmpl = Template.instance()
			,	pageId = tmpl.pageId.get();
			return pageId && {block: this, page: CustomPages.findOne({_id: pageId})};
		},
		isLastBlock(index) {
			const blockCount = Blocks.find({}, {sort: {index: 1}}).count();
			return (index==(blockCount-1));
		},
		isFirstBlock(index) {
			return (index==0);
		},
		backButtonUrl() {
			let url = '/custom';
			const pageType = Session.get('customPagesPageType')
			,	pageNumber = Session.get('customPagesPageNumber');

			if(pageType && pageNumber) url += '?type='+pageType+'&p='+pageNumber;
			else if(pageType) url += '?type='+pageType;
			else if(pageNumber) url += '?p='+pageNumber

			return url;
		},
		websiteBaseUrl() {
			return Meteor.settings.public.url;
		}
	});

	if(tmpl=='createCustomPage') {
		if(Meteor.isClient) {
			Meteor.methods({
				'blocks.update'(data, id) {
					Blocks.update(id, data);
					Meteor.modal('#editContentModal', 'hide');
					Session.set('editBlockId', null);
					Session.set('editBlockType', null);
				}
			});
		}
	
		Template[tmpl].events({
			'click [data-action="open-language-version"]'() {
				FlowRouter.go('/custom/'+this._id);
				BlazeLayout.reset();
				BlazeLayout.render('App_body', {main: 'createCustomPage'});
			},
			'click [data-action="edit-page-settings-modal"]'() {
				Meteor.modal('#editPageSettingsModal');
			},
			'click [data-action="add-block-modal"]'() {
				Meteor.modal('#addBlockModal');
				Session.set('addBlockReferenceId', this._id);
			},
			'click [data-action="add-block-new"]'(ev) {
				const referenceId = Session.get('addBlockReferenceId')
				,	referenceBlock = Blocks.findOne({_id: referenceId});
				let	newIdx;

				if(referenceBlock) newIdx = referenceBlock.index;
				else newIdx = Blocks.find({}).count();

				if(newIdx!=undefined && newIdx!=null) {
					const $target = $(ev.target)
					,	action = '[data-action="add-block-new"]'
					,	$btn = ($target.is(action))?$target:$target.parents(action)
					,	newType = $btn.data('type')
					,	data = blockSchemes[newType].clean({index: newIdx}, {
						extendAutoValueContext: {
							isInsert: true,
							isUpdate: false,
							isUpsert: false,
							isFromTrustedCode: false
						}
					});

					if(referenceBlock) {
						// update index
						const updateIndexBlocks = Blocks.find({index: {$gte: newIdx}}).fetch();
						for(let block of updateIndexBlocks) {
							Blocks.update({_id: block._id}, {$inc: {index: 1}});
						}
					}

					// insert new
					Blocks.insert(data);

					Meteor.modal('#addBlockModal', 'hide');
				}
			},
			'click [data-action="edit-content-modal"]'() {
				Session.set('editBlockId', this._id);
				Session.set('editBlockType', this.type);
				Meteor.modal('#editContentModal');

				const $modal = $('#editContentModal')
				,	fn = (ev,modalId)=>{
					if(modalId=='#editContentModal') {
						Session.set('editBlockId', null);
						Session.set('editBlockType', null);
						$modal.off('closed', fn);
					}
				};
				$modal.on('closed', fn);
			},
			'click [data-action="delete-block-new"]'() {
				Blocks.remove({_id: this._id});
			},
			'click [data-action="move-up"]'() {
				if(this.index>0) {
					Blocks.update({index: this.index-1}, {$set: {index: this.index}});
					Blocks.update({_id: this._id}, {$set: {index: this.index-1}});
				}
			},
			'click [data-action="move-down"]'() {
				const max = Blocks.find({}).count();
				if(this.index<(max-1)) {
					Blocks.update({index: this.index+1}, {$set: {index: this.index}});
					Blocks.update({_id: this._id}, {$set: {index: this.index+1}});
				}
			},
			'click [data-action="save-custom-page"]'(ev,tmpl) {
				const contents = Blocks.find({}, {sort: {index: 1}}).fetch()
				,	pageId = tmpl.pageId.get()
				,	$target = $(ev.target)
				,	action = '[data-action="save-custom-page"]'
				,	$btn = ($target.is(action))?$target:$target.parents(action);

				// fix index if needed
				for(let i=0;i<contents.length;i++) {
					contents[i].index = i;
				}

				Meteor.loader();

				Meteor.call('customPages.updateContents', pageId, contents, ()=>{
					Meteor.loader('hide');
				});
			}
		});
	}
}