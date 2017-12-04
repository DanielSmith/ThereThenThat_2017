
/*
**  tttUils.js
*/

const util = require('util');
const uuid = require("node-uuid");
const datefns = require('date-fns');
var validator = require('validator');

const fs = require('fs');
const { join } = require('path')
const ROOT_PUBLIC_DIR = './public';
const ROOT_UPLOAD_DIR = './public/uploads';

// delete this soon
var moment = require('moment');

const MetaInspector = require('node-metainspector-with-headers');

const MAX_EARTH_RADIUS = 6300 * 1000; // meters
const MAX_ALTITUDE = 500 * 1000; // meters (ISS is typically ~403km)

const STATUS_LOC_OK = "STATUS_LOC_OK";
const STATUS_LOC_ERR = "STATUS_LOC_ERR";
const STATUS_LOC_ERR_LAT = "STATUS_LOC_ERR_LAT";
const STATUS_LOC_ERR_LON = "STATUS_LOC_ERR_LON";
const STATUS_LOC_ERR_ALT = "STATUS_LOC_ERR_ALT";

const STATUS_TIME_OK = "STATUS_TIME_OK";
const STATUS_TIME_ERR = "STATUS_TIME_ERR";

const STATUS_TAGS_OK = "STATUS_TAGS_OK";
const STATUS_TAGS_ERR = "STATUS_TAGS_ERR";

const STATUS_PEOPLE_OK = "STATUS_PEOPLE_OK";
const STATUS_PEOPLE_ERR = "STATUS_PEOPLE_ERR";


function nonEmpty(testEmpty, foo = "bat") {
  return (testEmpty.trim() !== '');
}

function tossEmpty(elems) {
  return elems.filter(nonEmpty);
}


function todayDir() {
  return  datefns.format(new Date(), 'YYYY-MM-DD');
}


function checkLocationParam(min, max, param) {
  if (param === "*" || param === "_") {
    return true;
  }

  if (isNaN(param) || param < min || param > max) {
    return false;
  } else {
    return true;
  }
}


// deeper tree output
function logfulltree(whatever) {
  console.log(util.inspect(whatever, false, null));
}


function getURLInfo(url) {
  let client = new MetaInspector(url, { timeout: 5000 });
  let description = '';
  let title = '';

  client.on("fetch", function() {
    description = client.description;
    title = client.title;

    return {
      url,
      title,
      description
    };
  });

  client.fetch();
}


function getLink(theBody) {

  // much more parsing to do with this...
  return getURLInfo(theBody.link);
}


// where theParams is an incoming node req.params object
function separateParams(theParams) {
  // our default for each field is "none specified"
  // we use '_' as in "it is blank".. this character was chosen
  // in part because it does not end up getting urlencoded
  let params = {
    location: "_",
    lat: "_",
    lng: "_",
    time: "_",
    tags: "_",
    people: "_",
    options: "_",
    title: "default title",
    description: "default description"
  };

  // a param could be '0'
  // cant be empty or null
  for (p in params) {
    if (theParams[p] !== undefined &&
        theParams[p] !== '' && theParams[p] !== null) {
      params[p] = theParams[p];
    }
  }

  return params;
}



function doValidations(params) {
  
  let location = {}, time = {}, tags = {};
  
  location = validateLocation(params.location);
  time = validateTime(params.time);
  tags = validateTags(params.tags);
  people = validatePeople(params.people);
  title = validateTitle(params.title);
  description = validateDescription(params.description);
  
  
  // console.dir(location);
  // console.dir(time);
  // console.dir(tags);
  // console.dir(people);
  // console.dir(title);
  // console.dir(description);
  
  // console.log('=================== in doV  .......');

  return {
    location, 
    time, 
    tags, 
    people,
    title,
    description
  };
}


// Address Specification: Location Component

// - always three fields, separated by commas ','
// - valid characters for lat/lon/alt values: '-', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
// - longitude is always a decimal number of arbitrary precision, with a range from -180 to 180
// - latitude is always a decimal number of arbitrary precision, with a range from -90 to 90
// - altitude is always a decimal number of arbitrary precision. Negative numbers specify an elevation below sea level.
// - 0,0,0 is the default for the location component, and should be taken to mean "no location specified".  It is expected that most installations will pick a local point (such as the location of the server, nearby landmark, etc.) so that the "local default" is something other than 0,0,0.

// sample longitudes:
// valid: -180.0, -179.9999, 5, .387, 122.5874873
// invalid: -180.0001, 48.33.33, 34N

// sample latitudes:
// valid: -90, 90.0, 0, 0.0, 34.753
// invalid: -90.0001, 91

// sample altitudes:
// valid: 0, .45, -.9, -448.3
// invalid: any negative number greater than the radius of the earth in meters

function validateLocation(location = '_') {

  console.log(`in valid...    ${location}`);


  // console.log(`validateLocation  with ${location}`);

  // we return an object - easier to do fine grained searches later
  // if we grab what is handy here...
  let locationParams = { 
    component: "_",
    latitude: "0",
    longitude: "0",
    error: []
  };

  [latitude = "0", longitude = "0", altitude = "0"] = location.trim().split(/,/);

  // the "not specified" case
  if (latitude === "_" || latitude === "*") {
    locationParams.component = latitude;
    return locationParams;
  }


  // should check latitude, longitude, and altitude are numbers

  // valid latitude?
  if (!checkLocationParam(-90, 90, latitude)) {
    // error...
    locationParams.error.push(STATUS_LOC_ERR_LAT);
  } else {
    locationParams.latitude = locationParams.component = latitude;
  }

  // valid longitude?
  if (!checkLocationParam(-180, 180, longitude)) {
    locationParams.error.push(STATUS_LOC_ERR_LON);
    // error
  } else {
    locationParams.longitude = longitude;
    locationParams.component += `,${longitude}`;
  }

  // valid altitude?
  if (!checkLocationParam(-MAX_EARTH_RADIUS, MAX_ALTITUDE, altitude)) {
    // error
    locationParams.error.push(STATUS_LOC_ERR_ALT);
  } else {  
    locationParams.altitude = altitude;
    locationParams.component += `,${altitude}`;
  }

  return locationParams;
}

function validateTime(time = '') {

  const parsed = datefns.parse(time);

  console.log(`
    
  ${time}
  ${parsed}
  
  `);


  // we wil need to do something with parsed...

  let timeParams = { 
    component: "_",
    error: []
  };

    // the "not specified" case
  if (time === "_" || time === "*") {
    timeParams.component = time;

    return timeParams;
  }
  console.dir(timeParams);

  if (!validator.isISO8601(time))  {
    timeParams.error.push(STATUS_TIME_ERR);


    console.dir(timeParams);
    

    return timeParams;
  } else {

    console.log(`
    
    fine...........rs

    
    
    `);

  }

  // convert this to use date-fns
  let m = moment(time);

  timeParams.millisecond = m.millisecond();
  timeParams.seconds = m.seconds();
  timeParams.minutes = m.minutes();
  timeParams.hours = m.hours();
  timeParams.date = m.date();
  timeParams.month = m.month();
  timeParams.year = m.year();
  timeParams.quarter = m.quarter();
  timeParams.component = time;
  return timeParams;
}

function validateTags(tags = '') {

  let myTags = tags.trim().split(/[, ]/);
  let tagParams = { 
    component: "_",
    error: [],
    allTags: [],
    tagsByService: {}
  };

  myTags.map(tag => {

    // we copy tags that have a format such as service:identifier
    // so that we can treat them specially
    let microFormats = tag.split(/:/);
    if (microFormats.length > 1) {
      let [mKey, mVal] = microFormats;

      if (typeof tagParams.tagsByService[mKey] !== Array) {
        tagParams.tagsByService[mKey] = [];
      }
      tagParams.tagsByService[mKey].push(mVal);
    }

    // strip out the invalid ones...  use a filter
    tagParams.allTags.push(tag);

        // if we have valid entries at this point.. do a check and join...
    tagParams.component = tagParams.allTags.join(',');
    return tagParams;
  });


  return tagParams;
}


function checkDir(whichDir = '') {  
  
    const dir = `${ROOT_UPLOAD_DIR}/${whichDir}`;
  
    // in case we need the top level...
    if (!fs.existsSync(ROOT_PUBLIC_DIR)) {
        fs.mkdirSync(ROOT_PUBLIC_DIR);
    }
    if (!fs.existsSync(ROOT_UPLOAD_DIR)) {
        fs.mkdirSync(ROOT_UPLOAD_DIR);
    }
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
  }
  


function createUploadFilename(ext = '') {
  const ts = datefns.getTime(new Date());
  const unique = uuid.v4();

  return `${ts}-${unique}${ext}`;  
}

function validatePeople(people = '') {

  let myPeople = people.trim().split(/[, ]/);
  let peopleParams = { 
    component: "_",
    error: [],
    allPeople: [],
    peopleByService: {}
  }

    // strip out the invalid ones...  use a filter
  myPeople.map(person => {

    // we copy tags that have a format such as service:identifier
    // so that we can treat them specially
    let microFormats = person.split(/:/);
    if (microFormats.length > 1) {
      let [mKey, mVal] = microFormats;

      if (typeof peopleParams.peopleByService[mKey] !== Array) {
        peopleParams.peopleByService[mKey] = [];
      }
      peopleParams.peopleByService[mKey].push(mVal);
    }

    // if .. this is a valid person
    peopleParams.allPeople.push(person);

    // if we have valid entries at this point.. do a check and join...
    peopleParams.component = peopleParams.allPeople.join(',');
  });

  return peopleParams;
}


function validateTitle(title) {
  // for now..
  return title;
}


function validateDescription(description) {
  // for now..
  return description;
}


function makeAddress(validations) {


  console.log(validations);
  const location = validations.location || '_';
  const time = validations.time || '_';
  const people = validations.people || '';
  const tags = validations.tags || '_';

  return `/${location.component}/${time.component}/${tags.component}/${people.component}`;  
}


function createReSearch(pattern) {
    const rePattern = `${pattern}.*`;
    const re = new RegExp(rePattern, 'i');
    const searchObj = {
      $regex: re
    };

    return searchObj;
}

function createLocationSearch(coordinateStr) {
  let retVal = {};
  let latitudeFloat = longitudeFloat = 0.0;

  [lat, lng] = coordinateStr.trim().split(',');

  if (lng === undefined || lat === undefined) {
    return retVal;
  }

  // valid latitude?
  if (!checkLocationParam(-90, 90, lat)) {
    console.log('bad lat');
    return retVal;
  } else {
    latitudeFloat = parseFloat(lat);
  }

  // valid longitude?
  if (!checkLocationParam(-180, 180, lng)) {
    console.log('bad lng');
    return retVal;
  } else {
    longitudeFloat = parseFloat(lng);
  }

  retVal = {
    "$near": {
      "$geometry": {
        "type": "Point",
        "coordinates": [ longitudeFloat, latitudeFloat ]                                
      },
      "$maxDistance": 20000
    }
  };
 
  // logfulltree(retVal);
  return retVal;
}


/*
**  createMultiMatchSearch - put together search for tags or people
**
**  sample call  createMultiMatchSearch("this,tagtwo,other")
**  would return { $all: [ "this" , "tagtwo", "other"] }
**
*/
function createMultiMatchSearch(elementsStr) {
  let retVal = {};
  let elems = elementsStr.trim().split(',');

  let elemAr = elems.map(cur => {
    return `${cur.trim()}` 
  });

  retVal = {
    $all: elemAr 
  };

  // logfulltree(retVal);
  return retVal;
}



function getExt(theFile) {
  if (mimeUtils.mimeTable[theFile.mimetype]) {
    return mimeUtils.mimeTable[theFile.mimetype].ext;
  }
}

// these belong in the commmon/mimeUtils.js module...
// need to resolve importing from vue and node sides...

let mimeUtils = {
  
  // since there is no server side DB,
  // we use the filename extension to map
  // to a type (image, audio, or video),
  // so that we know how to render
  mimeTable: {

    // images
    "image/jpeg": {
      type: "image",
      ext: "jpg"
    },

    "image/png": {
      type: "image",
      ext: "png"
    },

    "image/bmp": {
      type: "image",
      ext: "bmp"
    },

    "image/gif": {
      type: "image",
      ext: "gif"
    },
    
    // audio
    "audio/x-wav": {
      type: "audio",
      ext: "wav"
    },
    
    "audio/mpeg": {
      type: "audio",
      ext: "mp3"
    },
    
    // video
    "video/mp4": {
      type: "video",
      ext: "mp4"
    },

    "video/x-m4v": {
      type: "video",
      ext: "m4v"
    },

    "video/ogg": {
      type: "video",
      ext: "ogv"
    },
  }    
}

module.exports = {
  tossEmpty,
  getLink,
  separateParams,
  doValidations,
  validateLocation,
  validateTime,
  validateTags,
  validatePeople,
  validateTitle,
  validateDescription,
  makeAddress,
  createReSearch,
  createLocationSearch,
  createMultiMatchSearch,
  createUploadFilename,
  todayDir,
  checkDir,
  getExt,
  logfulltree
};