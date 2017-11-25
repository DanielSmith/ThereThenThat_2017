<template>
  <v-app light
    @dragover.native="dragOver"
    @drop.native="doDrop"
    @dragstart.native="dragOver"
    @dragend.native="dragEnd"
    @paste.native="onPaste($event)">

    <TTTHeader></TTTHeader>

    <main>
      <SearchAndCreate></SearchAndCreate>
      <v-container fluid>
        <v-layout row v-for="curItem in this.pastedList" key="curKey++">
          <v-flex xs8 class="mediaBox">
            <v-card flat pb-5>
              <component :itemPath="curItem.data.src" key="curKey++" v-bind:is="imageComponent">
              </component>
            </v-card>
            <v-spacer></v-spacer>
          </v-flex>
        </v-layout>

        <v-layout row v-for="curItem in this.addedList" key="curKey++">
          <v-flex xs12>
            <v-card flat pb-5>

              <component :itemPath="curItem.data.src" key="curKey++" v-bind:is="curItem.componentType">
              </component>
              <v-spacer></v-spacer>

            </v-card>
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex xs12>
            <v-card v-for="curItem in this.curCollectionList.renderLinks" :key="curItem.data._id">
              <v-container fluid grid-list-lg>
                <v-layout row wrap>
                  <v-flex xs7 class="mediaBox">
                    <h4>{{ curItem.data.originalname }} - <br>  <a :href=curItem.data.url target="fromTTT"> {{ curItem.data.url }}</a> </h4>
                    <p>{{ curItem.data.description }} {{ curItem.data._id }} </p>

                    <component :itemPath="getCurMedia(curItem.data)" key="curKey++" v-bind:is="curItem.componentType">
                    </component>


                    <v-btn @click="syncTags(curItem.data._id)">sync</v-btn>
                  </v-flex>
                  <v-flex xs4>
                    <p> tags and info will go here...</p>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import TTTHeader from '@/components/TTTHeader';
import SearchAndCreate from '@/components/SearchAndCreate';
import axios from 'axios';

import audioComponent from './Audio';
import videoComponent from './Video';
import imageComponent from './Image';
import textComponent from './Text';
import mimeUtils from '../../../common/mimeUtils';

export default {
  name: 'CurrentCollection',

  components: {
    TTTHeader,
    SearchAndCreate,
    audioComponent,
    videoComponent,
    imageComponent,
    textComponent
  },
  
  data() {
    return {

      currentView: 'videoComponent',

      // put this in some global config
      SERVER_HOST: 'localhost',
      SERVER_PORT: '3100',

      itemList: [],
      pastedList: [],
      addedList: [],

      curCollectionList: [],
      imageList: []
    }
  },

  mounted: function() { 
    this.getSingleCollection();
  },


  methods: {
    // call server for JSON data
    getSingleCollection() {

      const path = `http://${this.SERVER_HOST}:${this.SERVER_PORT}${this.$route.path}`;

      fetch(path)
        .then(response => response.json())
        .then(response => {

          this.curCollectionList = response;
          this.curCollectionList.renderLinks = [];
          this.curCollectionList.links.map(cur => {
            let newObj = {};

            newObj.data = cur;
            console.log('cur is... ');
            newObj.componentType = mimeUtils.getItemType(cur.fileName)
            console.log(newObj);
            this.curCollectionList.renderLinks.push(newObj);
          });

  console.log('==============');
          console.log(JSON.stringify(this.curCollectionList));
          console.log('==============');
        })        
        .catch(err => {
          console.log(err);
        });
    },

    getNewElementForType(theType) {

      switch (theType) {
        case "image":
          return new Image();
          break;

        case "audio":
          return new Audio();
          break;

        case "video":
          return document.createElement('video');
          break;

        default:
          return ''; // what to use for this...?
          break;
      }
    },

    onPaste(event) {
      let index = 0;
      let items = (event.clipboardData || event.originalEvent.clipboardData).items;

      // do a check here to see if it is an image...
      let imageItem = items[0];
      let imageFile = imageItem.getAsFile();
      const container = this.curCollectionList._id;


      if (imageItem.kind === 'file') {
        let reader = new FileReader();

        let URLObj = window.URL || window.webkitURL;
        let source = URLObj.createObjectURL(imageFile);

        // The URL can then be used as the source of an image
        this.createImage(source);

        reader.onload = (event) => {
          let myImage = new Image();
          myImage.src = event.target.result;

          myImage.onload = () => {
            // this.doUpload(myImage);
          }

        };
        reader.readAsDataURL(imageFile);
        this.doUpload(imageFile);
      }
    },


    doDroppedLink: function(event) {
      let src = '';

      if ([...event.dataTransfer.types].includes('text/plain')) {
        event.dataTransfer.types.map(curType => {
          if (curType === 'text/plain') {
            let link = event.dataTransfer.getData('Text');
            console.log(`we see ${src}`);

            const container = this.curCollectionList._id;
            const address = this.curCollectionList.address;

            let mynow = Date.now();

            axios.post(`http://localhost:3100/api/addlink`, {  link, container })
              .then(response => {
                  let newLink = {
                    _id: response.data._id,
                    url: response.data.url,
                    title: response.data.title,
                    description: response.data.description
                  }

                  this.curCollectionList.links.push(newLink);
              })
              .catch((err) => {
                  console.log(err);
              })

              return;
            }
          })
        }

        if (src !== '') {
          let curImage = new Image();
          let canvas = document.createElement('canvas');
          let ctx = canvas.getContext('2d');

          curImage.onload = () => {
            canvas.width = curImage.width;
            canvas.height = curImage.height;
            ctx.drawImage(curImage, 0, 0);

            // this.imageList.unshift(curImage);

            fetch(canvas.toDataURL('image/png'))
              .then(res => res.blob())
              .then(blob => {
                this.doUpload(blob);
              })
          }

        curImage.setAttribute('crossOrigin', 'anonymous');
        curImage.src = src;
        this.imageList.unshift(curImage.src);
      }
    },

    doDroppedFiles: function(event) {
      let theFiles = Array.from(event.dataTransfer.files);
      let myImageList = this.imageList;

      theFiles.map(curFile => {
        // get file type
        let curFileData = mimeUtils.getData(curFile);

        // am sure this should be reworked.. hacked it from being
        // image-only to image, audio, or video
        let reader = new FileReader();
        reader.onload = (inner) => {

          let droppedItem = this.getNewElementForType(curFileData.type);
          let newObj = {};
          newObj.componentType = mimeUtils.getItemType(curFileData.ext);
          newObj.data = droppedItem;

          droppedItem.onload = () => {
            // this.showDropHelp = 0;
          }

          droppedItem.src = reader.result;
          this.addedList.push(newObj);
        }

        reader.readAsDataURL(curFile);
        this.doUpload(curFile, curFileData.ext);
      })
    },

    doUpload(uploadFile, extension = "png") {
      const uploadData = new FormData();
      uploadData.append('thefile', uploadFile);
      uploadData.append('title', 'media upload');
      uploadData.append('extension', extension);
      uploadData.append('description', 'media description');
      uploadData.append('container', this.curCollectionList._id);

      const config = {
        headers: { 'content-type': 'multipart/form-data' }
      }

      axios.post(`http://${this.SERVER_HOST}:${this.SERVER_PORT}/api/fileupload`, uploadData, config)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    doDrop: function(event) {
      event.preventDefault();
      this.doDroppedFiles(event);
    },


    OLDdoDrop: function(event) {
      event.preventDefault();

      if (event.dataTransfer.getData('Text') !== '') {
        this.doDroppedLink(event);
      } else {
        this.doDroppedFiles(event);
      }

      let link = event.dataTransfer.getData('Text');


      // should break this out for different media types
      // and do it on a per file basis
      if (event.dataTransfer.types) {
        // do a map in here...
      }

      let curImage = new Image();
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');

      curImage.onload = () => {
        canvas.width = curImage.width;
        canvas.height = curImage.height;
        ctx.drawImage(curImage, 0, 0);
        let image = document.createElement('img');
        image.src = canvas.toDataURL('image/png');

        this.doUpload(image);
      }

      curImage.setAttribute('crossOrigin', 'anonymous');
      curImage.src = link;
    },


    createImage: function(source) {
      let pastedImage = new Image();
      pastedImage.onload = function() {

        // console.dir(pastedImage);
        // let height = pastedImage.height;
        // let width = pastedImage.width;
        // let length = pastedImage.length;
      }
      pastedImage.src = source;
      this.pastedList.unshift(pastedImage.src);
    },


    // specific drag / drop / paste handlers for
    // Collection list - these would put items on
    // a shalf for use with a specific collection
    dragEnd: function(args) {
      args.preventDefault();
    },

    dragOver: function(args) {
      args.preventDefault();
    },

    checkCuritem(item) {
      return item.entryType === "image";
    },

    getCurMedia(item) {
      return `http://${this.SERVER_HOST}:${this.SERVER_PORT}/${item.path}`;
    },

    syncTags(id) {

      alert('sync  ' + id);
      // const tags = this.allTags[id];
      id = '5a18cf00ff23740b5ec52185';
      const tags = ['one', 'two', 'three'];

      console.log(tags);
      let apiPath = `${this.$config.SERVER}${this.$config.SERVER_PORT}/api/synctags`,              
        dbArgs = { id: id, tagquery: tags };

      console.log( apiPath );
      const config = { headers: { 'Content-Type': 'application/json' } };

      axios.post(apiPath, dbArgs, config)
        .then(response => {
          console.log(response);
        })
        .catch(err => {
          console.log(err);
        });
    }

  }
}
</script>

<style lang="stylus">
@import '../stylus/main'

img, audio, video {
  max-width: 60%;
}

.mediaBox {
  border: solid 1px red;
}
</style>
