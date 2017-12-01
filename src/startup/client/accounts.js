/*
* @Author: Philipp
* @Date:   2017-01-31 13:59:25
* @Last Modified by:   Philipp
* @Last Modified time: 2017-01-31 14:38:02
*/

'use strict';

import {FlowRouter} from 'meteor/kadira:flow-router';

AccountsTemplates.configure({
	// Behavior
	confirmPassword: true,
	enablePasswordChange: true,
	forbidClientAccountCreation: true,
	overrideLoginErrors: true,
	sendVerificationEmail: false,
	lowercaseUsername: false,
	focusFirstInput: true,

	// Appearance
	showAddRemoveServices: false,
	showForgotPasswordLink: false,
	showLabels: true,
	showPlaceholders: true,
	showResendVerificationEmailLink: false,

	// Client-side Validation
	continuousValidation: false,
	negativeFeedback: false,
	negativeValidation: true,
	positiveValidation: true,
	positiveFeedback: true,
	showValidating: true,

	// Privacy Policy and Terms of Use
	// privacyUrl: 'privacy',
	// termsUrl: 'terms-of-use',

	// Routing
	defaultLayout: 'App_body',
	defaultLayoutRegions: {
		header: 'header'
	},
	defaultContentRegion: 'main',

	// Redirects
	homeRoutePath: '/',
	redirectTimeout: 4000,

	// Hooks
	onLogoutHook: function() {
		FlowRouter.go('/login');
	},
	// onSubmitHook: mySubmitFunc,
	// preSignUpHook: myPreSubmitFunc,
	// postSignUpHook: myPostSubmitFunc,

	// Texts
	// texts: {
	// 	button: {
	// 		signUp: "Register Now!"
	// 	},
	// 	socialSignUp: "Register",
	// 	socialIcons: {
	// 		"meteor-developer": "fa fa-rocket"
	// 	},
	// 	title: {
	// 		forgotPwd: "Recover Your Password"
	// 	},
	// }
});