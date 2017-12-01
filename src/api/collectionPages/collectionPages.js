/*
* @Author: philipp
* @Date:   2017-08-22 12:52:31
* @Last Modified by:   philipp
* @Last Modified time: 2017-12-01 11:37:38
*/

/*
* @Author: Philipp
* @Date:   2017-06-08 17:08:40
* @Last Modified by:   philipp
* @Last Modified time: 2017-08-22 12:32:18
*/

'use strict';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { CleanString } from '/imports/tools/CleanString.js';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';

import { TMPL_COLL } from '/imports/core/api/collections/collections.js';

import { CollectionTools } from '/imports/tools/CollectionTools.js';

export const Collections = TMPL_COLL;

const mainLang = Meteor.settings.public.availableLanguages[0];

if(Meteor.isServer) {
	// methods
	Meteor.methods({
        'collectionPages.init'() {
            init();
        },
        'collectionPages.remove'(id) {
            const page = Collections.findOne({_id: id});

            if(page) {
                const coll = Mongo.Collection.get(page.collection);
                try {
                    coll.rawCollection().drop();    
                } catch(e) {
                    console.log('Drop Collection Error for '+page.name);
                    console.log(e);
                }
                
                Collections.remove({_id: id});
            }
            
        }
    });

    const init = () => {
        const pages = Collections.find({}).fetch();

        for(let page of pages) {
            const coll = Mongo.Collection.get(page.collection);

            if(!coll) {
                console.log('SETUP: ', page.name);
                const TMPL_COLL = new Mongo.Collection(page.collection)
                ,   TMPL_VAR = page.tmplVar;

                // add schema
                const schema = CollectionTools.parseSchema(page.baseSchema, page.langSchema, Meteor.settings.public.availableLanguages);
                TMPL_COLL.attachSchema(schema);

                Meteor.publish('all-'+TMPL_VAR, () => {
            		return TMPL_COLL.find({}, {sort: {index: 1}});
            	});

                Meteor.publish(TMPL_VAR+'-tags', function () {
                    ReactiveAggregate(this, TMPL_COLL, [
                        {
                            $group: {
                                _id: null,
                                tags: { $addToSet: "$tags" }
                            }
                        },
                        { 
                            $addFields: {
                                tags: {
                                    $reduce: {
                                        input: "$tags",
                                        initialValue: [],
                                        in: { $setUnion: [ "$$value", "$$this" ] }
                                    }
                                }
                            }
                        }
                    ], { clientCollection: "CollectionPagesTags" });
                });

                Meteor.publish('page-'+TMPL_VAR, (pageCount, currentPage) => {
                    return TMPL_COLL.find({}, {sort: {index: 1}});
                });

                Meteor.methods({
                    [TMPL_VAR+'.pageCount']() {
                        if(Meteor.userId()) {
                            return TMPL_COLL.find({}).count();
                        }
                    },
                    [TMPL_VAR+'.create'](data) {
                        console.log(data);
                        if(Meteor.userId()) {
                            
                            // add index
                            data.index = TMPL_COLL.find({}).count();
                            // create other langs
                            for(let lang of Meteor.settings.public.availableLanguages) {
                                if(lang!=mainLang) data[lang] = data[mainLang];
                            }

                            TMPL_COLL.insert(data); 
                        }
                    },
                    [TMPL_VAR+'.delete'](id) {
                        if(Meteor.userId()) {
                            return TMPL_COLL.remove({_id: id}, {multiple: true});
                        }
                    },
                    [TMPL_VAR+'.update'](data, id) {
                        if(Meteor.userId()) {
                            TMPL_COLL.update(id, data);
                        }
                    },
                    [TMPL_VAR+'.updateOrder'](list) {
                        if(Meteor.userId()) {
                            console.log('UPDATE ORDER');
                            for(let item of list) {
                                TMPL_COLL.update({_id: item._id}, {$set: {index: item.index}}, {multi: true});
                            }
                        }   
                    },
                    [TMPL_VAR+'.addTag'](id, tag) {
                        if(Meteor.userId()) {
                            const hasTag = TMPL_COLL.findOne({_id: id, tags: {$in: [tag.toLowerCase()]}});
                            if(!hasTag) {
                                TMPL_COLL.update({_id: id}, {$push: {tags: tag.toLowerCase()}});
                            }
                        }
                    },
                    [TMPL_VAR+'.removeTag'](id, tag) {
                        if(Meteor.userId()) {
                            const update = TMPL_COLL.update({_id: id}, {$pull: {tags: tag.toLowerCase()}});
                        }
                    }
                });
            }

            const schema = CollectionTools.parseSchema(page.baseSchema, page.langSchema, Meteor.settings.public.availableLanguages);

            export const TMPL_SCHEMA = new SimpleSchema(schema);

            TMPL_COLL.attachSchema(TMPL_SCHEMA);
        }
    };

    init();
}