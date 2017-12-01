/*
* @Author: philipp
* @Date:   2017-08-21 23:40:20
* @Last Modified by:   philipp
* @Last Modified time: 2017-09-25 14:47:59
*/

// ONLY EDIT THIS FILE IN THE CORE!

import 'meteor/useraccounts:bootstrap';

// local DB
// import '/imports/core/persistent-client-db.js';

// setups
import '/imports/core/startup/client/routes.js';
import '/imports/core/startup/client/accounts.js';
// import '/imports/core/startup/client/startup.js';

// global templates
import '/imports/core/ui/autoform/autoform-media-manager/autoform-media-manager.js';
import '/imports/core/ui/components/modal/modal.js';
import '/imports/core/ui/components/bigLoader/bigLoader.js';

import '/imports/core/ui/components/imageUpload/upload.js';
import '/imports/core/ui/components/imageUpload/multiuploadPreview.js';