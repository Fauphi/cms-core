/*
* @Author: philipp
* @Date:   2017-09-25 14:44:52
* @Last Modified by:   philipp
* @Last Modified time: 2017-09-25 15:03:58
*/

'use strict';

import { Meteor } from 'meteor/meteor';

Meteor.loader = function(action='show', message='Saving your changes') {
	if(action=='hide') {
		setTimeout(function() {
			$('body,html').css('overflow', 'auto');
			$('#autorformLoader').removeClass('in');
			setTimeout(()=>{
				$('#autorformLoader').remove();
			},300);
		}, 1380-300);
	} else if(action=='show') {

		const loaderHtml = `
			<div id="autorformLoader">
				<div class="flexcenter">
					<div class="loader-af">
						<div class="cssload-cube cssload-c1"></div>
						<div class="cssload-cube cssload-c2"></div>
						<div class="cssload-cube cssload-c4"></div>
						<div class="cssload-cube cssload-c3"></div>
					</div>
					<div class="text">${message}</div>
				</div>
			</div>
		`;

		$('body').append(loaderHtml);

		$('body,html').css('overflow', 'hidden');
		setTimeout(()=>{
			$('#autorformLoader').addClass('in');
		},100);
	}
};
