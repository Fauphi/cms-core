/*
* @Author: Philipp
* @Date:   2017-03-24 12:56:44
* @Last Modified by:   philipp
* @Last Modified time: 2017-09-19 18:12:32
*/

'use strict';

import { Translations } from '/imports/core/api/translations/translations.js';

const sanitizeHtml = require('sanitize-html');

const HANDLEBAR_RX = /({{{)\s(i18n)\.([^\.]+)\.([^\.]+)\s(}}})/
// ,	HANDLEBAR_HELPER_RX = /({{{)\s((?!i18n\.).*)\s(i18n)\.([^\.]+)\.([^\.]+)\s(}}})/
,	HANDLEBAR_HELPER_RX = /({{{)\s((?!i18n\.)[^}]*)\s(i18n)\.([^\.]+)\.([^\s]+)([^}]*\s)(}}})/
,	PLACEHOLDER_IMAGE = 'http://res.cloudinary.com/do8gcokmo/image/upload/v1487696837/image-placeholder_fznwvy.jpg';

export class Cleanup {

	constructor(htmlString, lang) {
		const html = this._removeUnwantedChars(htmlString);
		this.$html = $('<div>'+html+'</div>');
		this.lang = lang;
	}

	// clean up htmlString string
	_removeUnwantedChars(htmlString) {
		const partialsRegExp = new RegExp(/({{>)([^}]+)(}})/, 'g')
		,	commentRegExp = new RegExp(/({{!--)((?!--}})[\s\S])*(--}})/, 'g')
		// ,	otherRegExp = new RegExp(/({{)(#|\/)[^}]+(}})/, 'g')
		// ,	otherRegExp = new RegExp(/({{)(#)[^}]+(}})(((?!{{\/)[\s\S])*)({{)(\/)[^}]+(}})/, 'g')
		,	handlebarRegExp = new RegExp(/({{(#|\/)(if|each|with))([^}]*)(}})/, 'g')
		,	removeLinebreaks = new RegExp(/\r?\n|\r/, 'g')
		,	nbspRX = new RegExp(/&nbsp;/, 'g');

		// removes linebreaks and multiple whitespaces
		htmlString = htmlString.replace(removeLinebreaks, ' ').replace(/[\s]+/g, ' ');

		return htmlString.replace(partialsRegExp, '')
				.replace(commentRegExp, '')
				.replace(handlebarRegExp, '')
				.replace(nbspRX, ' ');
	}

	// extracts the category and key from the attribute string
	_extractLabel($item, attr) {
		const $itemClone = $item.clone()
		,	handlebarRX = new RegExp(HANDLEBAR_RX, 'g')
		,	handlebarHelperRX = new RegExp(HANDLEBAR_HELPER_RX, 'g');

		let attrValue = $item.attr(attr);

		if(attrValue) {
			attrValue = attrValue.trim();

			const match = handlebarRX.exec(attrValue)
			,	helperMatch = handlebarHelperRX.exec(attrValue);
			
			let trans, category, key;

			if(match && match.length==6) {
				category = match[3];
				key = match[4];
			} else if(helperMatch && (helperMatch.length==7 || helperMatch.length==8)) {
				category = helperMatch[4];
				key = helperMatch[5];
			}

			return {category: category, key: key, $clone: $itemClone};
		}

		return false;
	}

	getHtmlString() {
		return this.$html.html();
	}

	// css background images
	cleanUpBackgroundImages() {
		$.each(this.$html.not('svg').find('[style]'), function(idx, elm) {
			const $item = $(elm)
			,	res = this._extractLabel($item, 'style');
			
			if(res.category) {
				const trans = Translations.findOne({category: res.category, key: res.key});

				// add edit attributes
				$item
					.attr({
						'data-action': 'edit-img',
						'data-label': res.category+'.'+res.key
					})
					.css({
						'background-image': 'url('+((trans && trans[this.lang])?trans[this.lang]:PLACEHOLDER_IMAGE)+')'
					});
			}
		}.bind(this));	
	}
	
	// img tag images (with & without helpers)
	cleanUpImageTags() {
		$.each(this.$html.find('img'), function(idx, img) {
			const $item = $(img)
			,	res = this._extractLabel($item, 'src');

			if(res) {
				const trans = Translations.findOne({category: res.category, key: res.key})
				,	$editTrigger = $('<span>');
					
				// add edit attributes
				$editTrigger.attr({
					'data-action': 'edit-img',
					'data-label': res.category+'.'+res.key
				});

				// set image source
				res.$clone.attr('src', (trans && trans[this.lang])?trans[this.lang]:PLACEHOLDER_IMAGE);

				$editTrigger.append(res.$clone);
				$item.replaceWith($editTrigger);
			}
		}.bind(this));
	}

	// text labels
	cleanUpTextLabels() {
		let result = this._removeUnwantedChars(this.$html.html());
		
		const labelRegExp = new RegExp(/({{{)(\s)[..\/]*(i18n\.)[^}]+(\s)(}}})/, 'g')
		,	labels = result.match(labelRegExp) || [];

		for(let item of labels) {
			const handlebarRX = new RegExp(HANDLEBAR_RX, 'g')
			,	match = handlebarRX.exec(item);

			if(match && match.length==6) {
				const trans = Translations.findOne({category: match[3], key: match[4]})
				,	label = match[3]+'.'+match[4];
				
				let	input = '<span data-action="edit-label" data-label="'+label+'"></span>';
				if(trans && trans[this.lang]) {
					input = '<span data-action="edit-label" data-label="'+label+'">'+trans[this.lang]+'</span>';
				}

				result = result.replace(new RegExp(item, 'g'), input);
			}
		}

		this.$html = $('<div>'+result+'</div>');
	}

	// resizes images
	resizeImages() {
		$.each(this.$html.find('img'), function() {
			var src = $(this).attr('src')
			,	split = (src)?src.split('/upload'):src;
            
            $(this).attr('src', (split)?split[0]+'/upload/q_70,w_1000'+split[1]:src);
		});

		$.each(this.$html.find('[style*="background-image"]'), function() {
			var css = $(this).css('background-image')
			,	src = css.replace('url("', '').replace('")', '')
			,	split = (src)?src.split('/upload'):src;

        	$(this).css('background-image', 'url("'+((split)?split[0]+'/upload/q_70,w_1000'+split[1]:src)+'")');
		});
	}

}