/*
* @Author: philipp
* @Date:   2017-08-22 11:35:59
* @Last Modified by:   philipp
* @Last Modified time: 2017-11-02 15:05:36
*/

'use strict';

export const UpdateSchema = new SimpleSchema({
    firstname: {
        type: String,
        label: "Firstname"
    },
    lastname: {
        type: String,
        label: "Lastname"
    },
    position: {
        type: String,
        label: "Position"
    },
    location: {
        type: String,
        label: "Location"
    },
    profileImage: {
        type: String,
        optional: true,
        label: "Profile image",
        autoform: {
            afFieldInput: {
                type: 'cloudinary'
            }
        }
    }
});

export const SignUpSchema = new SimpleSchema({
    email: {
        type: String,
        label: "Email",
        autoform: {
            placeholder: "Email.."
        }
    },
    firstname: {
        type: String,
        label: "Firstname",
        autoform: {
            placeholder: "Firstname.."
        }
    },
    lastname: {
        type: String,
        label: "Lastname",
        autoform: {
            placeholder: "Lastname.."
        }
    },
    position: {
        type: String,
        label: "Position",
        autoform: {
            placeholder: "Position.."
        }
    },
    location: {
        type: String,
        label: "Location",
        autoform: {
            placeholder: "Location.."
        }
    },
    profileImage: {
        type: String,
        optional: true,
        label: "Profile image (optional)",
        autoform: {
            afFieldInput: {
                type: 'cloudinary'
            }
        }
    }
});