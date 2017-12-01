/**
 * @description: Inits the dragover/leave events on the body, also used by audio-multiupload
 */
Meteor.initDragDrop = function() {
	var dragleaveTimeout
	,	added = false; 

	// add drag&drop handlers
	$(document.body).on('dragover', function(ev) {
		ev.preventDefault();

		// check if a file is dragged
		var dataTransfer = ev.originalEvent.dataTransfer;
		if(dataTransfer.types) if(!checkDragType(dataTransfer)) return false;

		clearTimeout(dragleaveTimeout);

		if(!added) {
			var divElement = '<div id="drop_overlay" class="fadein-drop">\
						        <div class="wrapper">\
						            <p class="image-icon">\
						                <i class="fa fa-picture-o" aria-hidden="true"></i>\
						            </p>\
						            <p class="description">\
						                Drop your files here to upload.\
						            </p>\
						        </div>\
						    </div>';
			$(document.body).append(divElement);

			$('#drop_overlay').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				$(this).removeClass('fadein-drop');
			});
			added = true;
		}
	});

	$(document.body).on('dragleave', function(ev) {
		dragleaveTimeout = setTimeout(function() {
			$('#drop_overlay').addClass('fadeout-drop').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				$('#drop_overlay').remove();
				added = false;
			});
		}, 100);		
	});

	$(document.body).on('drop', function() {
		added = false;
	});

	Session.set('bodyDragActive', true);
}

/**
 * @description: Check if file is dragged and not a DOM element.
 */
var checkDragType = function(dataTransfer) {
	for (var i=0; i<dataTransfer.types.length; i++) {
        if(dataTransfer.types[i] == "Files") {
            return true;
        }
    }
    return false;
}