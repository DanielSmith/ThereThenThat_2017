/*
**  app.js - ThereThenThat - server side entry point
*/

const express = require('express');
const app = express();
let server = require('http').createServer(app);  
let io = require('socket.io')(server);

const router = require('./router');
const apiRouter = require("./api");
const tttconfig = require("./config.json");
const mongoose = require('mongoose');

mongoose.connect(tttconfig.MONGO_DB_CONNECT, {
  useMongoClient: true,
});  

// this results in many lines of GET /sockjs-node/info
app.use(require('morgan')("combined"));

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// app.locals.counter = 1;

app.all('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header("Access-Control-Expose-Headers", "x-flashmessages");
  next();
});

app.use("/", router);
app.use("/api", apiRouter);

app.listen(tttconfig.SERVER_PORT, function () {
  io.on('connection', function(client) {  
    console.log('Client connected...');
    
    client.on('join', function(data) {
      console.log(data);
      client.emit('messages', 'Hello from server');
    });
  });
});

