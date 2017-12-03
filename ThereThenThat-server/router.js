
/*
**  router.js
*/

const tttUtils = require("./tttUtils.js");
const uuid = require("node-uuid");
const express = require('express');
const app = express.Router();
const path = require('path');
module.exports = app;


app.use(express.static(path.join(__dirname, 'public')));

// app.use(express.static('uploads'));

const { Container, Link } = require('./models/ttt');

app.get('/sockjs-node*', function(req, res, next) {
  res.status(200);
});


// this set of checks is for gathering up our variables
// we give a lot of flexibility by allowing for a variable
// number of arguments
app.get('/:location', function(req, res, next) {
  res.locals.params = tttUtils.separateParams(req.params);
  
  console.log('------lll ');
  console.dir(req.params);
  next();
});  


app.get('/:location/:time', function(req, res, next) {

  console.log('------time');  
  console.dir(req.params);

  res.locals.params = tttUtils.separateParams(req.params);
  next();
});


app.get('/:location/:time/:tags', function(req, res, next) {
  console.log('------tags');
  console.dir(req.params);
  res.locals.params = tttUtils.separateParams(req.params);
  next();
});


app.get('/:location/:time/:tags/:people', function(req, res, next) {
  console.log('------people');
  console.dir(req.params);
  res.locals.params = tttUtils.separateParams(req.params);
  next();
});


app.get('/:location/:time/:tags/:people/:options', function(req, res, next) {
  console.log('------ options');
  console.dir(req.params);
  res.locals.params = tttUtils.separateParams(req.params);
  next();
});


// list all collections
app.get('/', function(req, res) {

  console.log('.....  get...');

  Container.find({})
    .exec(function(err, existingAddress) {

      if (err) {
        console.log(err);
        return next(err);
      }
      
      console.log(existingAddress);
      if (existingAddress) {
        return res.status(200).json(existingAddress);
      } else {
        res.send(existingAddress);
      }
  });
});



// going for a specific collection
app.get('*', function(req, res, next) {
  console.log('--parm LOCAL');
  console.log(res.locals.params);
  console.log('--parm LOCAL end ');
  if (res.locals.params === undefined) {
    res.send('bad url');

  } else {
    res.locals.validations = tttUtils.doValidations(res.locals.params);
  }


  res.locals.address = tttUtils.makeAddress(res.locals.validations);
  
  
  console.log(res.locals);


  // fix this to sort by date
  Container.findOne({ address: res.locals.address })
    .populate({ path: 'links', options: { sort: { 'size': -1 }}})
    .exec(function(err, existingAddress) {
    if (err) { return next(err); }

    if (existingAddress) {
      return res.status(200).json(existingAddress);
    } else {
      res.send(req.params);
    }
  });
});

