/*
* @Author: philipp
* @Date:   2017-08-08 19:32:53
* @Last Modified by:   philipp
<<<<<<< Updated upstream
* @Last Modified time: 2017-09-06 11:49:37
=======
* @Last Modified time: 2017-08-28 14:31:28
>>>>>>> Stashed changes
*/

'use strict';

import { Meteor } from 'meteor/meteor';

Meteor.modal = function(modalId, action='show') {
	const $modal = $(modalId);

	if($modal.length) {
		const $content = $modal.find('.content')
		,	$cancel = $modal.find('[data-action="cancel-modal"]').last();

		if(action=='hide') {
			$modal.trigger('closed', modalId);
			
			$modal.removeClass('in');
			
			$content.off('click', stopProp);
			// $modal.off('click', (closeModal($modal, $content, $cancel)));
			$cancel.off('click', (closeModal(modalId, $modal, $content, $cancel)));
			
			$('html,body').css('overflow', 'auto');
		} else if(action=='show') {
			$modal.addClass('in');
			
			$modal.trigger('opened', modalId);

			$content.on('click', stopProp);
			// $modal.on('click', (closeModal($modal, $content, $cancel)));
			$cancel.on('click', (closeModal(modalId, $modal, $content, $cancel)));

			$('html,body').css('overflow', 'hidden');
		}
	}
};

const closeModal = (modalId, $modal, $content, $cancel)=>{
	return (ev)=>{
		$modal.trigger('closed', modalId);

		$modal.removeClass('in');

		$content.off('click', stopProp);
		// $modal.off('click', (closeModal($modal, $content, $cancel)));
		$cancel.off('click', (closeModal($modal, $content, $cancel)));

		$('html,body').css('overflow', 'auto');
	}
}

const stopProp = function(ev) {
	if(ev.target == this) {
		console.log('stopProp');
		ev.stopPropagation();
	}
}