/*
* @Author: philipp
* @Date:   2017-08-09 11:49:15
* @Last Modified by:   philipp
* @Last Modified time: 2017-10-02 17:29:50
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { People } from '/imports/core/api/people/people.js';

import { blockSchemesObj as projectSchemesObj } from '/imports/ui/pages/customPages/clientCollections.js';

import { Utils } from '/imports/tools/Utils.js';

export const Blocks = new Mongo.Collection(null);

const defaultImage = "https://res.cloudinary.com/dq1of6pww/image/upload/v1502092960/td14gsv55goxigebwbbs.png"
,	blockSchemesObj = {
	asCmsText: {
		'content.text': {
	        type: String,
	        label: "Text",
	        defaultValue: "Enter text...",
	        autoform: {
	            afFieldInput: {
	                type: 'quilleditor'
	            }
	        }
	    },
	    'content.alignment': {
	        type: String,
	        label: "Text-Alignment",
	        allowedValues: ["left", "center", "right"],
	        defaultValue: "left"
	    }
	},
	asCmsImage: {
		'content.url': {
	        type: String,
	        label: "Image",
	        defaultValue: defaultImage,
	        autoform: {
	            afFieldInput: {
	                type: 'mediaManager'
	            }
	        }
	    },
	    'content.text': {
	        type: String,
	        label: "Text",
	        defaultValue: "Image text",
	        optional: true,
	        autoform: {
	            afFieldInput: {
	                type: 'quilleditor'
	            }
	        }
	    }
	},
	asCmsColumns: {
	    'content.url1': {
	        type: String,
	        label: "Image 1",
	        defaultValue: defaultImage,
	        autoform: {
	            afFieldInput: {
	                type: 'mediaManager'
	            }
	        }
	    },
	    'content.text1': {
	        type: String,
	        label: "Text 1",
	        defaultValue: "Image text 1",
	        autoform: {
	            afFieldInput: {
	                type: 'quilleditor'
	            }
	        }
	    },
	    'content.url2': {
	        type: String,
	        label: "Image 2",
	        defaultValue: defaultImage,
	        autoform: {
	            afFieldInput: {
	                type: 'mediaManager'
	            }
	        }
	    },
	    'content.text2': {
	        type: String,
	        label: "Text 2",
	        defaultValue: "Image text 2",
	        autoform: {
	            afFieldInput: {
	                type: 'quilleditor'
	            }
	        }
	    },
	    'content.url3': {
	        type: String,
	        label: "Image 3",
	        defaultValue: defaultImage,
	        autoform: {
	            afFieldInput: {
	                type: 'mediaManager'
	            }
	        }
	    },
	    'content.text3': {
	        type: String,
	        label: "Text 3",
	        defaultValue: "Image text 3",
	        autoform: {
	            afFieldInput: {
	                type: 'quilleditor'
	            }
	        }
	    }
	},
	asCmsHero: {
	    'content.url': {
	        type: String,
	        label: "Image",
	        defaultValue: "/assets/img/hero.jpg",
	        autoform: {
	            afFieldInput: {
	                type: 'mediaManager'
	            }
	        }
	    },
	    'content.text': {
	        type: String,
	        label: "Text",
	        defaultValue: "Hero Image",
	        autoform: {
	            afFieldInput: {
	                type: 'quilleditor'
	            }
	        }
	    }
	},
	asCmsBigTitle: {
	    'content.text': {
	        type: String,
	        label: "Text",
	        defaultValue: "Enter text...",
	        autoform: {
	            afFieldInput: {
	                type: 'quilleditor'
	            }
	        }
	    },
	    'content.showPageDate': {
	        type: Boolean,
	        label: "Show Page Date",
	        defaultValue: false
	    }
	},
	asCmsPeople: {
	    'content.people': {
	        type: String,
	        label: "People",
	        defaultValue: {name: "Add..."},
	        blackbox: true,
	        autoform: {
	        	options: function() {
	        		const people = People.find({}).fetch()
	        		,	array = [];

	        		for(let person of people) {
	        			array.push({value: person._id, label: person.name});
	        		}

	        		return array;
	        	}	
	        }
	    }
	},
	asCmsSeparator: {}
};

const baseSchema = {
	blockId: {
		type: String,
		label: "BlockId",
		autoValue: function() {
			if(this.isInsert) return new Date().getTime();
			else this.unset();
		},
        autoform: {
        	omit: true
        }
	},
	type: {
		type: String,
        defaultValue: "",
        autoform: {
        	omit: true
        }
	},
	index: {
        type: Number,
        label: "Index",
        autoform: {
        	omit: true
        }
    },
    content: {
    	type: Object
    },
};

const schemesObj = Utils.extend({}, blockSchemesObj, projectSchemesObj);

for(let key in schemesObj) {
	const final = Object.assign({}, baseSchema, schemesObj[key]);
	final.type.defaultValue = key;
	schemesObj[key] = new SimpleSchema(final);
}

export const blockSchemes = schemesObj;
