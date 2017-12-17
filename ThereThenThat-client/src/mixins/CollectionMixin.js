import uuidv4 from 'uuid/v4';

export const CollectionMixin =  {
  data() {
    return {

    }
  },

  methods: {
        
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
        this.$router.push({ name: 'TagView', params: { tags: tag }})
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