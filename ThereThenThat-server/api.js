
/*
**  api.js
*/

const path = require('path')
const express = require('express');
const tttconfig = require("./config.json");
const tttUtils = require("./tttUtils.js");
const util = require('util');
const MetaInspector = require('node-metainspector-with-headers');
const { Container, Link, GeoCode } = require('./models/ttt');
const router = express.Router();

// file upload handling
const multer  = require('multer');

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const checkTodayDir = tttUtils.todayDir();
    tttUtils.checkDir(checkTodayDir);
    cb(null, `public/uploads/${checkTodayDir}`)
  },
  filename: function (req, file, cb) {        
    let ext = tttUtils.getExt(file);
    cb(null, tttUtils.createUploadFilename(`.${ext}`));
  }
})


let multerUpload = multer({ storage: storage })
let uploadFile = multerUpload.single('thefile');

const http = require('request-promise-json');
const api = express();
const bodyParser = require("body-parser");

api.use(bodyParser.urlencoded({extended: false}));
api.use(bodyParser.json());

module.exports = router;

// create a collection
// TBD: allow for just one main component (location, time, or tags)
// dont allow _/_/_
router.post("/create", function (req, res, next) {

  res.locals.params = tttUtils.separateParams(req.body);
  res.locals.validations = tttUtils.doValidations(res.locals.params);

  const address = tttUtils.makeAddress(res.locals.validations);

  // at this point.. we need to check and see if this address already exists...
  // if it does, we should refuse to make a new collection...
  // at least for this particular user...
  Container.findOne({ address: address })
    .exec(function(err, existingAddress) {
    if (err) { return next(err); }

    if (existingAddress) {
      // troubles with this..
      // res.writeHead(200, {"Content-Type": "application/json"});
      // res.send(JSON.stringify(existingAddress));
      res.json(existingAddress);
    } else {

      // we're good to go...
      // const longitude = parseFloat(res.locals.validations.lng);
      // const latitude = parseFloat(res.locals.validations.lat);
      
      // const longitude = '29.0';
      // const latitude =  '29.0';
      
      const longitude = parseFloat(res.locals.validations.location.longitude);
      const latitude = parseFloat(res.locals.validations.location.latitude);
  
      const ttt = new Container({
        version: "1",
  
        gps: { coordinates: [ longitude, latitude] },
        tags: res.locals.validations.tags,
        // people: res.locals.validations.people,
        time: res.locals.validations.time,
        location: res.locals.validations.location,
        title: res.locals.validations.title,
        // description: res.locals.validations.description,
        address: address
      });
  
      ttt.save(function(err, newContainer) {
        if (err) { return next(err); }
  
        // get the container id, and launch a query to google maps
        // to get more info about this lat/lon
  
        const gcLatitude = newContainer.location.latitude;
        const gcLongitude = newContainer.location.longitude;
        const gcAddress = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${gcLatitude},${gcLongitude}&key=AIzaSyCmM-nTQGEZymwEvI0wHbDn9Dwh8Vdfn3s`;
  
        http.get(gcAddress)
          .then(function(resultJson) {
            // saving the json from the call to google maps as an object
            const gc = new GeoCode({
              geoData: resultJson
            });
  
            gc.save(function(err, newGC) {
              if (err) { console.log('ERROR: ',  err); }
            });
  
            returnObj = {};
            returnObj.status = 'ok';
            returnObj.address = address;
            
            // errors on this...
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(returnObj));  
        })
        .catch(function(err) {
            console.log(err);
        });
      });
    }
  });
});


// add a link to a specific collection
router.post("/addlink", function (req, res, next) {
  res.locals.newLinkInfo = tttUtils.getLink(req.body);

  const url = req.body.link;
  const theContainer = req.body.container

  const client = new MetaInspector(url, { timeout: 5000 });
  let description = '';
  let title = '';

  client.on("fetch", function() {
    description = client.description;
    title = client.title;

    let linkId = 0;

    const link = new Link({
      url: url,
      title: title,
      description: description
    });


    link.save(function(err, theLink) {

      if (err) { return next(err); }

      Container.update(
        { "_id": theContainer }, {
          $addToSet: { "links": theLink._id }
        },
        function(err, result) {
          console.log(result);
        }
      );

      linkId = theLink._id;

      res.json({
        _id: linkId,
        theContainer,
        url,
        title,
        description
      });
    });
  });


  client.on("error", function(err) {
    res.send(err);
  });

  client.fetch();
});




router.post('/gettags', function(req, res, next) {
  
  console.dir(req.body.tagquery);

  let returnObj = {};
  if (req.body.tagquery === undefined ||
    req.body.tagquery === '') {
    res.send('none');
  }

  const tAry = req.body.tagquery.split(/ +/);
  console.log(tAry);

  Link.find({ tags: { $all: tAry }})
  .exec(function(err, existingMedia) {   
    if (err) { return next(err); }

    returnObj.status = 'ok';
    returnObj.mediaInfo = existingMedia;
    res.writeHead(200, {"Content-Type": "application/json"});    
    res.end(JSON.stringify(returnObj));
  })
})

router.post('/synctags', function(req, res, next) {
  

  console.log(req.body);
  // needs much better error handling
  if (req.body.tagquery === undefined ||
    req.body.tagquery === '') {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify( { status: 'error'}));
    return;
  }

  
  const query = {'clientId': req.body.clientId };
  const tags = req.body.tagquery;
  const updateTags = {
    tags: tags
  };

  Link.findOneAndUpdate(query, { $set: updateTags }, function(err, result) {
    if(err){
      console.log(err);
    }
    console.log("RESULT: " + result);
    res.send('Done')
  });
})


// this and addlink share the DB save code.. should refactor
router.post('/fileupload', uploadFile, function(req, res, next) {
  const theContainer = req.body.container;
  const url = "none";
  const title = req.body.title;
  const description = req.body.description;
  const extension = req.body.extension;
  const clientId = req.body.clientId;
  
  const pathToUse = req.file.path.replace('public', '') || 'none';
  console.log(req.file);
  // tell the DB about it...
  
  const link = new Link({
    url: url,
    title: title,
    description: description,
    entryType: "image",
    clientId: clientId,
    
    extension: extension,
    originalname: req.file.originalname,
    fileName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    encoding: req.file.encoding,
    path: pathToUse
  });

  link.save(function(err, theLink) {

    if (err) { return next(err); }

    Container.update(
      { "_id": theContainer }, {
        $addToSet: { "links": theLink._id }
      },
      function(err, result) {
        console.log(result);
      }
    );

    linkId = theLink._id;

    res.json({
      _id: linkId,
      theContainer,
      url,
      title,
      description
    });
  });

  // we need the container and some details...
  // this is not a link per se, but we fill in most
  // of those fields
});


router.post("/search", function (req, res, next) {

  let query = {};
  let returnObj = {};
  

  const title = req.body.title || '';
  const description = req.body.description || '';
  const location = req.body.location || '';
  const time = req.body.time || '';
  const tags = req.body.tags || '';
  const people = req.body.people || '';

  // title
  if (title !== '') {
    query['title'] = tttUtils.createReSearch(title);
  }

  // description
  if (description !== '') {
    query['description'] = tttUtils.createReSearch(description);
  }

  // location
  if (location !== '') {
    query['gps'] = tttUtils.createLocationSearch(location);
  }

  // time
  // we are going to start out by just matching against the time.component...
  // we'll go wild with other possible matches later... regexp for now..
  if (time !== '') {
    query['time.component'] = tttUtils.createReSearch(time);
  }

  // tags
  if (tags !== '') {
    query['tags.allTags'] = tttUtils.createMultiMatchSearch(tags);
  }

  // people
  if (people !== '') {
    query['people.allPeople'] = tttUtils.createMultiMatchSearch(people);
  }

  // tttUtils.logfulltree(query) ;

  Container.find(query)
    .exec(function(err, foundCollections) {

    if (err) { 
      console.log('ERRR');
      return next(err); }

    if (foundCollections) {

      console.log(foundCollections);
      returnObj.status = "ok";
      returnObj.searchInfo = foundCollections;

      // res.writeHead(200, {"Content-Type": "application/json"});    
      res.json(returnObj);

    } else {
      res.send('nope');
    }
  });
});

