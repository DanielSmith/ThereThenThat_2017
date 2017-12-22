/*
**  ttt.js - models for ThereThenThat
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const byDaySchema = new Schema({
  id: String,
  
  theDay: String,
  timestamp: String,
  timeSaved: { type: Date, default: Date.now },

  // this gets populated from the Link collection
  links: [
    {type: Schema.Types.ObjectId, ref: 'Link' }
  ]
});

// define model
const containerSchema = new Schema({
  id: String,

  version: String,
  address: String,
  timestamp: String,
  title: String,
  description: String,
  timeSaved: { type: Date, default: Date.now },

  // this gets populated from the Link collection
  links: [
    {type: Schema.Types.ObjectId, ref: 'Link' }
  ],

  // this was added so that it could be indexed for $near searches
  // it might make sense to break it out into its own model
  // that way, it could be used by links as well...
  gps: {
    type: {
      type: "String",
      required: true,
      enum: ['Point', 'LineString', 'Polygon'],
      default: 'Point'
    },
    coordinates: [Number]
  },

  location: {
    component: String,
    full: String,
    placeName: String,
    latitude: String,
    longitude: String,
    altitude: String
  },

  time: {
    component: String,
    milliseconds: String,
    seconds: String,
    minutes: String,
    hours: String,
    day: String,
    month: String,
    year: String,
    dayName: String,
    dayOfWeek: String,
    dayOfYear: String,
    weekOfYear: String,
    quarter: String,
    timestamp: String
  },

  tags: {
    component: String,
    allTags: [ String ],
    tagsByService: {
    }
  },

  people: {
    component: String,
    allPeople: [ String ],
    peopleByService: {
      // as in, by accounts on Twitter, Facebook, etc
    }
  },

  options: [ String ]
});


// this is going to migrate to a more flexible itemSchema
const linkSchema = new Schema({
  url: String,
  title: String,
  description: String,
  extension: String,

  // TL;DR - a handle to treat known and yet to be uploaded things the same...
  // we generate an ID on the client side, as soon as an item
  // is pasted or dropped.. that gives us a way to handle
  // tagging before we actually know the ObjectId of this link
  clientId: String,

  entryType: { type: String, default: "url" },
  timeSaved: { type: Date, default: Date.now },
  
  // support for 1 external d ata item
  data: { type: String, default: "unused" },
  originalname: String,
  fileName: String,
  mimeType: String,
  size: Number,
  encoding: String,
  path: String,

  tags: [{
    type: String
  }]
});

const geoCodingShema = new Schema({
  updated: { type: Date, default: Date.now },
  geoData: Object 
});


containerSchema.index({ 'gps': '2dsphere' });

// create model classes
const Container = mongoose.model('Container', containerSchema);
const Link = mongoose.model('Link', linkSchema);
const GeoCode = mongoose.model('GeoCode', geoCodingShema);
const DayContainer = mongoose.model('DayContainer', byDaySchema);


// export model
module.exports = {
  byDaySchema,
  containerSchema,
  linkSchema,
  Container,
  Link,
  GeoCode,
  DayContainer
};


