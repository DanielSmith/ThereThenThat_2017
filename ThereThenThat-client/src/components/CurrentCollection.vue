<template>
  <v-app light
    @dragover.native="dragOver"
    @drop.native="doDrop"
    @dragstart.native="dragOver"
    @dragend.native="dragEnd"
    @paste.native="onPaste($event)">

    <TTTHeader :context="this.headerTitle"></TTTHeader>
    <!-- <SearchAndCreate></SearchAndCreate> -->
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
          <v-card v-if="this.numItems === 0" :key="needMedia">
            <v-container fluid grid-list-lg>
              <v-layout row wrap>
                <v-flex xs7>

                    <p>Drag media items here...</p>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
          <v-card v-for="curItem in this.curCollectionList.renderLinks" :key="curItem.data._id">
            <v-container fluid grid-list-lg>
              <v-layout row wrap>
                <v-flex xs7 class="mediaBox">

                  <component :itemPath="getCurMedia(curItem.data)" :allData="curItem" key="curKey++" v-bind:is="curItem.componentType">
                  </component>

                </v-flex>
                <v-flex xs4>
                  <!-- <h4>{{ curItem.data.originalname }} - <br>  <a :href=curItem.data.url target="fromTTT"> {{ curItem.data.url }}</a> </h4> -->

                  <v-btn color="indigo" dark @click="toggleEdit(curItem.id)"><v-icon dark left>mode_edit</v-icon></v-btn>
                </v-flex>

                <v-form v-if="showEditTags[curItem.data._id]" ref="form">
                  <v-layout pl-5 row>
                    <v-flex xs4>
                      <v-text-field
                      label="Enter new tags"
                      v-model="allTagEdits[curItem.data._id]"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-btn @click="submitTags(curItem.data._id)">Add Tags</v-btn>
                    </v-flex>
                  </v-layout>
                </v-form>
                <v-btn  v-for="curTag in allTags[curItem.data._id]" key="curKey++"
                  @click="chooseTag(curItem.data._id, curTag)"
                  >
                  <strong> {{ curTag }} </strong> 
                  <span class="showEditTag" v-if="showEditTags[curItem.data._id]"> X  </span>
                </v-btn>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
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

      itemList: [],
      pastedList: [],
      addedList: [],

      allTags: {},
      allTagEdits: {},
      showEditTags: {},

      curCollectionList: [],
      imageList: [],
      numItems: 0,

      headerTitle: 'fetching collection...'
    }
  },

  mounted: function() { 
    this.getSingleCollection();
  },


  methods: {
    // call server for JSON data
    getSingleCollection() {

      const path = `${this.$config.SERVER}${this.$config.SERVER_PORT}${this.$route.path}`;
      this.numItems = 0;

      fetch(path)
        .then(response => response.json())
        .then(response => {

          this.headerTitle = response.title;
          this.curCollectionList = response;
          this.curCollectionList.renderLinks = [];
          this.curCollectionList.links.map(cur => {
            let newObj = {};
            this.numItems++;

            newObj.data = cur;
            newObj.componentType = mimeUtils.getItemType(cur.fileName)
            console.log(newObj);
            newObj.tags = cur.tags || [];
            newObj.id = cur._id;

            this.$set(this.showEditTags, newObj.id, false);
            this.$set(this.allTagEdits, newObj.id, '');
            this.$set(this.allTags, newObj.id, newObj.tags);
            this.curCollectionList.renderLinks.push(newObj);
          });
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

        // do something for text too?

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

            const container = this.curCollectionList._id;
            const address = this.curCollectionList.address;

            let mynow = Date.now();

            axios.post(`${this.$config.SERVER}${this.$config.SERVER_PORT}/api/addlink`, { 
               link, container })
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
          newObj.data.path = droppedItem.curSrc;

          droppedItem.onload = () => {
            // this.showDropHelp = 0;
          }

          droppedItem.src = reader.result;
          this.addedList.push(newObj);

          // this.curCollectionList.renderLinks.push(newObj);
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

      axios.post(`${this.$config.SERVER}${this.$config.SERVER_PORT}/api/fileupload`, uploadData, config)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });

      this.numItems++;
    },


    doDrop: function(event) {
      event.preventDefault();

      if ([...event.dataTransfer.types].includes('text/plain')) {
        this.doDroppedLink(event)
      } else {
        this.doDroppedFiles(event);
      }
    },

    createImage: function(source) {
      let pastedImage = new Image();
      pastedImage.onload = function() {
        //
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
      return `${this.$config.SERVER}${this.$config.SERVER_PORT}/${item.path}`;
    },


    toggleEdit(id) {
      this.showEditTags[id] = !this.showEditTags[id];
    },

    submitTags(id) {
      
      // rewrite this.. the empty and null cases can cause problems
      console.log(this.allTags);
      // am also being careful not to send an empty tag
      let tAry = (this.allTagEdits[id]).split(/ +/);
      tAry = tAry.filter(val => val !== '');

      if (tAry.length === 0) { tAry = ['']; }
      if (this.allTags[id] === null) { this.allTags[id] = []; }

      const newTagsAr = [...this.allTags[id], ...tAry].sort();
      let newTags = [...new Set(newTagsAr)];
      newTags = newTags.filter(val => val !== '');
      this.$set(this.allTags, id, newTags);

      this.showEditTags[id] = false;
      this.allTagEdits[id] = '';
      this.syncTags(id);
    },

    chooseTag(id, tag) {
      // are we editing, or doing a search?
      if (this.showEditTags[id]) {
        const newTags = this.allTags[id].filter(val => val !== tag);
        this.$set(this.allTags, id, newTags);
        this.syncTags(id);
      } else {
        tag = tag.trim();
        // this pushes over to TagView
        this.$router.push({ name: 'TagView', params: { tags: tag }})
      }
    },


    syncTags(id) {

      const tags = this.allTags[id];

      let apiPath = `${this.$config.SERVER}${this.$config.SERVER_PORT}/api/synctags`,              
        dbArgs = { id: id, tagquery: tags };

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
  /* border: solid 1px red; */
}
</style>
