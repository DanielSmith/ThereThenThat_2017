import axios from 'axios';
import mimeUtils from '../../../common/mimeUtils';
import uuidv4 from 'uuid/v4';

export const CollectionMixin =  {
  data() {
    return {
      curCollectionList: [],
      curKey: 1,    
      numItems: 0,
      allTags: {},
      allTagEdits: {},
      showEditTags: {}
    }
  },

  methods: {

    getTagView(tag = '') {
      
      if (tag === '') {
        tag  = this.$route.params.tags;
      }

      let apiPath = `${this.$config.SERVER}${this.$config.SERVER_PORT}/api/gettags`,              
        dbArgs = { tagquery: tag }
      // this.getMediaWithDB(tag, this.BY_KEYWORD);

      const config = { headers: { 'Content-Type': 'application/json' } };

      axios.post(apiPath, dbArgs, config)
        // .then(response => response.json())
        .then(response => {

          console.dir(JSON.stringify(response.data));
          this.curCollectionList = response;
          this.curCollectionList.links = response.data.mediaInfo;
          this.curCollectionList.renderLinks = [];
          this.curCollectionList.links.map(cur => {
            let newObj = {};
            this.numItems++;

            newObj.data = cur;
            newObj.componentType = mimeUtils.getItemType(cur.fileName)
            console.log(newObj);
            newObj.tags = cur.tags || [];
            newObj.id = cur.clientId;
            newObj.data.sourceType = "remote";

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
            newObj.tags = cur.tags || [];
            newObj.id = cur.clientId;
            newObj.data.sourceType = "remote";

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

    newUUID() {
      const curUUID = uuidv4();
      // console.log(curUUID);
      return curUUID;
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

    chooseTag(id, tag) {
      // are we editing, or doing a search?
      if (this.showEditTags[id]) {
        const newTags = this.allTags[id].filter(val => val !== tag);
        this.$set(this.allTags, id, newTags);
        this.syncTags(id);
      } else {
        tag = tag.trim();
        // this pushes over to TagView
        this.$router.push({ name: 'TagView', params: { tags: tag, mode: 'byTags' }})
      }
    },

    getCurMedia(item) {
      console.log(item);
      if (item.sourceType === "remote") {
        return `${this.$config.SERVER}${this.$config.SERVER_PORT}/${item.path}`;
      } else {
        // dropped or pasted
        return item.path;
      }
    },


    // specific drag / drop / paste handlers for
    // Collection list - these would put items on
    // a shalf for use with a specific collection
    dragEnd: function(args) {
      args.preventDefault();
    },

    dragOver: function(args) {
      console.log('dragover...');
      args.preventDefault();
    } 

  }
}