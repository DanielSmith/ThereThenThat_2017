# ThereThenThat

![ThereThenThat Logo](ThereThenThat-client/static/ttt-logo-small.png)

## Crowdsourced search by Location, Time, and Tags

## Overview

ThereThenThat is like a scrapbook for media and links.

ThereThenThat enables searching through time, space, and/or keyword.  Collections can be easily shared in a consistently formatted link.

It has elenents of Imgur, or Flickr, or a Blog...

* Drag and Drop links to web pages...
* Drag and Drop image, audio(mp3), and video(mp4) files into it...
* Paste screen captures...
* instant previews and auto-upload
* tag individual items

Users start a collection that expresses some “where, when, what”, and fill it with references and media that relate to that.  Think of something such as:

_"New York City, November 2017, CentralPark, Parade"_

## Build Setup

After cloning the repository, you will see this top level directory structure:
```

ThereThenThat
├── ThereThenThat-client
│   ├── build
│   ├── config
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── router
│   │   ├── store
│   │   └── stylus
│   ├── static
│   └── test
│       └── unit
│           └── specs
├── ThereThenThat-server
│   └── models
└── common




ThereThenThat
├── ThereThenThat-client
│   ├── build
│   ├── config
│   ├── src
│   ├── static
│   └── test
├── ThereThenThat-server
│   ├── models
│   └── public
└── common
```

### A few notes on dependencies:

There will be a future document about the architecture of ThereThenThat.  In broad strokes, the server side is a headless CMS, and the dev client runs in a completely seperate Node/Webpack/Vue.js environment. There is also a dependency on having a working MongoDB instance.

* Client - Vue.js, Vuetify, Vuex, Google Maps API
* Server - Node.js, Express, Multer, Mongoose, MongoDB

Open up two shells - one for server, one for client.

### Server Side
``` bash
cd ThereThenThat-server

# install dependencies
npm install

# Node process will run at port 8081
npm run server
```

You should be running a recent version of MongoDB.  Here is what I am using at the moment:

```bash
Brooklyn:projects dls$ mongo --version
MongoDB shell version v3.4.4
git version: 888390515874a9debd1b6c5d36559ca86b44babd
OpenSSL version: OpenSSL 1.0.2l  25 May 2017
allocator: system
modules: none
build environment:
    distarch: x86_64
    target_arch: x86_64
  ```


### Client Side

``` bash
cd ThereThenThat-client

# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

