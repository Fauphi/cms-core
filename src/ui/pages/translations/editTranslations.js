/*
* @Author: philipp
* @Date:   2017-09-06 09:52:14
* @Last Modified by:   philipp
* @Last Modified time: 2017-11-08 08:46:25
*/

"use strict";

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';

import { Translations } from '/imports/core/api/translations/translations.js';
// import { CustomPages } from '/imports/core/api/customPages/customPages.js';

import { Cleanup } from './cleanup.js';

import '/imports/core/ui/components/mediaManagerModal/mediaManagerModal.js';
import '/imports/ui/pages/templates/websiteScripts.js';

import './editTranslations.html';

const TMPL_NAME = 'core_editTranslations';

Template[TMPL_NAME].onCreated(function onCreated() {
	const that = this;

 	that.templateName = new ReactiveVar('home');
	that.html = new ReactiveVar();
	that.editLabel = new ReactiveVar();
	that.lang = new ReactiveVar('de');
	that.imgLang = new ReactiveVar('de');
	that.trigger = new ReactiveVar();

	that.subscribe('all-translations');
	// that.subscribe('all-custom-pages');
	that.subscribe('all-media');

	that.autorun(() => {
		FlowRouter.watchPathChange();

		const params = FlowRouter.current().params;
		if(params) that.templateName.set(params._name.replace('-', '/'));
	});
});

let editors = {};
// ,	activeEditor = null;

// ICU ONLY
const mediumHeaderTmpls = ['company/company', 'knowledge/knowledge', 'services/services', 'news/news'];

const cleanup = (html, lang) => {
	const cl = new Cleanup(html, lang);

	cl.cleanUpBackgroundImages();
	cl.cleanUpImageTags();
	cl.cleanUpTextLabels();
	cl.resizeImages();

	return cl.getHtmlString();
}

Template[TMPL_NAME].helpers({
	getHtml() {
		const tmpl = Template.instance()
		,	lang = tmpl.lang.get()
		,	tmplName = tmpl.templateName.get();

		// triggers translation reload
		tmpl.trigger.get();

		Meteor.call('translations.getHtml', tmplName, (err, res) => {
			const tmplHtml = res;
			
			// ICU ONLY: check if template has medium header
			if(mediumHeaderTmpls.indexOf(tmplName)>-1) {
				Meteor.call('translations.getHtml', 'partials/header/mediumHeader', (err, res) => {
					const category = tmplName.split('/')[0];
					res = res.replace(/mediumHeader/g, 'i18n.'+category);

					const trans = Translations.find({category: category}).fetch()
					,	linkPre = ' <li style="display: inline-block; padding: 0px 20px 60px; font-weight: bold;"><a class="icu-link dark-grey">'
					,	linkAfter = '</a></li> ';
					let links = '';
					for(let item of trans) {
						if(item.key.match(/^header_link_([1-9])$/i)) links += linkPre+'{{{ i18n.'+category+'.'+item.key+' }}}'+linkAfter;
					}

					res = res.replace(/({{#each)[\s\S]*(each}})/g, links);

					const cleanHeader = cleanup(res, lang, tmpl)
					,	cleanContent = cleanup(tmplHtml, lang, tmpl);

					tmpl.html.set(cleanHeader+cleanContent);
				});
			} else {
				tmpl.html.set(cleanup(tmplHtml, lang, tmpl));	
			}
			
		});

		return tmpl && tmpl.html.get();
	},
	editLabel() {
		const tmpl = Template.instance();
		
		tmpl.trigger.get();

		return tmpl && tmpl.editLabel.get();
	},
	initQuill() {
		const tmpl = Template.instance()
		,	data = tmpl.editLabel.get();
		
		if(data) {
			let clean = $.extend(true, {}, data);
			clean.en = data.en.replace(/<br\s\/>/g, '</p><p>').replace(/^<\/p><p>/g, '');
			clean.de = data.de.replace(/<br\s\/>/g, '</p><p>').replace(/^<\/p><p>/g, '');

			const options = {
			  	modules: { 
			  		toolbar: []
			  	},
			  	theme: 'snow'
			};

			setTimeout(()=>{
				$('.translations .textarea').each((index, el) => {
					const lang = $(el).data('lang');
					editors[lang] = new Quill($(el).get(0), options);
					$(el).find('.ql-editor').html('<p>'+clean[lang]+'</p>');
				});
			}, 100);
		}
	},
	isImage() {
		if(this.en && this.de) {
			const regex = new RegExp('^http(.*)(jpg|png|jpeg|gif|svg)$', 'gi');
			const isMatch = (!this.en.match('href') && this.en.match(regex));
			return (isMatch && isMatch.length>0);	
		} else {
			return false;
		}
	},
	// customPages() {
	// 	return CustomPages.find({});
	// },
    templateName() {
    	const tmpl = Template.instance();
		return tmpl.templateName.get();
    },
    availableLanguages() {
    	return Meteor.settings.public.availableLanguages;
    },
    languageLabel() {
    	return Meteor.settings.public.languageLables[this];
    },
    getUrl(key) {
    	const tmpl = Template.instance()
    	,	editLabel = tmpl.editLabel.get();
    	return editLabel[key];
    },
    resizeImage(url, width) {
		const _width = width || 200
		,	split = (url)?url.split('upload/'):null;
		return split && split[0]+'upload/w_'+_width+'/'+split[1];
	},
	currentLang() {
		const tmpl = Template.instance();
		return (this==tmpl.lang.get());
	},
	getImageColumnWidth() {
		const count = Meteor.settings.public.availableLanguages.length;
		return (100 / count) + '%';
	}
});

Template[TMPL_NAME].events({
	'click #website-styling a'(ev) {
		ev.preventDefault();
	},
	'click [data-action="change-language"]'(ev,tmpl) {
		tmpl.lang.set(this);
	},
	// 'click [data-action="open-link-modal"]'(ev) {
	// 	const lang = $(ev.target).prev('.textarea').data('lang')
	// 	activeEditor = editors[lang];
	// 	$('#link-modal').addClass('in');
	// },
	// 'click .textarea [data-action="remove-link"]'(ev) {
	// 	$(ev.target).remove();
	// },
	// 'click [data-action="add-link"]'() {
	// 	var range = activeEditor.getSelection();
	// 	if(range) {
	// 		if(range.length == 0) {
	// 			// insert label and link
	// 			const linkName = this.title;
	// 			activeEditor.insertText(range.index, linkName);
	// 			activeEditor.setSelection(range.index, linkName.length);
	// 			activeEditor.format('link', this.url);
	// 			activeEditor.setSelection(range.index+linkName.length+1, 0);
	// 		} else {
	// 			// insert only link (label is selected text)
	// 			var text = activeEditor.getText(range.index, range.length);
	// 			activeEditor.format('link', this.url);
	// 		}
	// 	} else {
	// 		console.log('User cursor is not in editor');
	// 	}
	// 	activeEditor = null;
	// 	$('#link-modal').removeClass('in');
	// },
	'click [data-action="edit-label"]'(ev, tmpl) {
		ev.stopPropagation();
		ev.preventDefault();

		const $target = $(ev.target)
		,	$elm = ($target.data('action'))?$target:$target.parents('[data-action="edit-label"]')
		,	label = $elm.data('label').split('.')
		,	trans = Translations.findOne({category: label[0], key: label[1]});

		tmpl.editLabel.set(trans);

		Meteor.modal('#edit-modal');
	},
	'click [data-action="edit-img"]'(ev, tmpl) {
		ev.stopPropagation();
		ev.preventDefault();

		const $target = $(ev.target)
		,	$elm = ($target.attr('data-label'))?$target:$target.parents('[data-label]')
		,	label = $elm.data('label').split('.')
		,	trans = Translations.findOne({category: label[0], key: label[1]});

		tmpl.editLabel.set(trans);

		Meteor.modal('#edit-modal');
	},
	'click [data-action="switch-lang"]'(ev, tmpl) {
		const $target = $(ev.target)
		,	$elm = ($target.is('span'))?$target.parent():$target
		,	lang = $elm.data('lang');

		tmpl.lang.set(lang);
	},
	'click [data-action="save-edit"]'(ev, tmpl) {
		ev.stopPropagation();

		let translations = {};

		tmpl.$('#edit-modal .translations .textarea').each((index, el) => {
			const lang = $(el).data('lang')
			,	$children = $(el).find('.ql-editor').children();

			let allParagraph = true;

			$children.each(function() {
				if(!$(this).is('p')) {
					allParagraph = false;
				}
			});

			if(allParagraph) {
				if($children.length > 1) {
					const html = $(el).find('.ql-editor').html();
					translations[lang] = (html=='<p></p>')?'':html;
				} else {
					const html = $(el).find('.ql-editor p').html();
					translations[lang] = (html=='<p></p>' || html=='<br>')?'':html;
				}
			} else {
				const html = $(el).find('.ql-editor').html();
				translations[lang] = (html=='<p></p>')?'':html;
			}
		});

		Meteor.call('translations.update', this._id, translations, function() {
			// triggers translation reload
			tmpl.trigger.set(Math.random());
		});

		Meteor.modal('#edit-modal', 'hide');

		// triggers translation reload
		tmpl.trigger.set(Math.random());
	},
	'click [data-action="open-media-manager"]'(ev, tmpl) {
		const $elm = $(ev.target);
		
		tmpl.imgLang.set(this);

		Meteor.modal('#media-manager-modal');

		tmpl.$('#media-manager-modal').on('closed', (ev,modalId)=>{
			if(modalId=='#media-manager-modal') {
				const data = tmpl.editLabel.get()
				,	url = Session.get('selectedMediaManagerImage');
				if(url) {
					data[tmpl.imgLang.get()] = url;
					tmpl.editLabel.set(data);

					tmpl.trigger.set(Math.random());
				}
			}
		});
	},
	'click [data-action="save-img-change"]'(ev, tmpl) {
		Meteor.call('translations.update', this._id, this, (err) => {
			if(!err) {
				// triggers translation reload
				tmpl.trigger.set(Math.random());
				Meteor.modal('#edit-modal', 'hide');
			}
		});
	}
});