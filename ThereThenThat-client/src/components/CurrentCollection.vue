<template>
  <v-app light
    @dragover.native="dragOver"
    @drop.native="doDrop"
    @dragstart.native="dragOver"
    @dragend.native="dragEnd"
    @paste.native="onPaste($event)">

    <TTTHeader></TTTHeader>

    <main>
      <SearchPickers></SearchPickers>

      <!-- <v-layout row v-for="curImage in this.imageList" key=curImage._id>
        <v-flex xs12 sm6 offset-sm3>
          <v-card>
            <img :src="curImage" />
          </v-card>
        </v-flex>
      </v-layout>
 -->
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs12 sm6 offset-sm3>
            <v-card v-for="curCollection in this.curCollectionList.links" :key="curCollection._id">
                <h4>{{ curCollection.originalname }} - <br>  <a :href=curCollection.url target="fromTTT"> {{ curCollection.url }}</a> </h4>
                <p>{{ curCollection.description }} {{ curCollection._id }} </p>

                <div v-if="checkCuritem(curCollection)">
                  <img :src="getCurImage(curCollection)">
                </div>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import TTTHeader from '@/components/TTTHeader';
import SearchPickers from '@/components/SearchPickers';
import axios from 'axios';

import audioComponent from './Audio';
import videoComponent from './Video';
import imageComponent from './Image';

export default {
  name: 'CurrentCollection',

  components: {
    TTTHeader,
    SearchPickers
  },
  
  data() {
    return {

      // put this in some global config
      SERVER_HOST: 'localhost',
      SERVER_PORT: '3100',

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
          console.dir(response);
          this.curCollectionList = response;
        })        
        .catch(err => {
          console.log(err);
        });
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
      let that = this;
      let myImageList = this.imageList;

      theFiles.map(curFile => {
        let reader = new FileReader();
        reader.onload = (inner) => {
          let droppedImage = new Image();
          droppedImage.onload = function() {
            myImageList.unshift(droppedImage.src);
          }
          droppedImage.src = reader.result;
        }

        reader.readAsDataURL(curFile);
        this.doUpload(curFile);
      })
    },

    doUpload(imageFile) {
      const uploadData = new FormData();
      uploadData.append('thefile', imageFile);
      uploadData.append('title', 'image upload');
      uploadData.append('description', 'image description');
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
      this.imageList.unshift(pastedImage.src);
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

    getCurImage(item) {
      console.log(JSON.stringify(item));


      return `http://${this.SERVER_HOST}:${this.SERVER_PORT}/${item.path}`;
      // return `http://${this.SERVER_HOST}:${this.SERVER_PORT}/uploads/2017-10-23/1508782049241-3dbb0356-5991-4b6b-b5bf-4a16793e8e11.jpg`;
    }
  }
}
</script>

<style lang="stylus">
@import '../stylus/main'

img {
  max-width: 400px;
}
</style>
