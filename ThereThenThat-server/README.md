# ThereThenThat-Server
ThereThenThat - Server Side POC

This is the beginning of my ThereThenThat server prototype.

The idea is to create collections which can be referred to by a link.  The link itself can express Location, Time, Tags, and People.  By merely passing on a link,
you're pointing to a collection of things on the web that relate to some event, or set of tags, etc.

It's crowdsourced search.

Once a collection is created, one can drag and drop links into it.  This server goes out and grabs the title and description for the link.

Yep, I did say drag and drop links, as in "from other browser windows".  It'll make more sense when I put up the client side.

At the moment, it will handle requests (such as, from PostMan) to:

* create a collection
* grab list of collections
* grab a single collection, with its links
* search by collection title, description, GPS location, tags, or people

Server side is currently made up of:

* Node v6.3.1
* Express
* Mongoose
* MongoDB

One of the things going on - it generates queries on the fly, such as:

```
{ title: { '$regex': /my.*/i },
  description: { '$regex': /def.*/i },
  gps: 
   { '$near': 
      { '$geometry': { type: 'Point', coordinates: [ -123, 39 ] },
        '$maxDistance': 20000 } },
  'tags.allTags': { '$all': [ 'this', 'that' ] },
  'people.allPeople': { '$all': [ 'daniel' ] } }
  ```
  
Install instructions and API docs - not yet (soon!).  Let me get the client side into shape to post.


