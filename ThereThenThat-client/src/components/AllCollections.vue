<template>
  <v-app light
    @dragover.native="dragOver"
    @drop.native="doDrop"
    @dragstart.native="dragOver"
    @dragend.native="dragEnd"  
  >

    <TTTHeader></TTTHeader>

  <v-content>
      <SearchAndCreate></SearchAndCreate>

      <v-container fluid>

        <v-layout row wrap>
          <v-flex xs12>
            <v-card flat pb-5 v-for="item in mainList" :key="item._id">
              <h4><a :href="item.fullURL">{{ item.title }}</a></h4>
              <p>{{ item.description }}</p>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>

  </v-content>
  </v-app>
</template>

<script>
import Vue from 'vue'
import TTTHeader from '@/components/TTTHeader'
import SearchAndCreate from '@/components/SearchAndCreate'
import { mapMutations, mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'AllCollections',

  components: {
    TTTHeader,
    SearchAndCreate
  },
  
  computed: {
  ...mapGetters({
    searchFromStore: 'getMySearchResult'
    })
  },

  watch: {
    searchFromStore() {
      this.mainList = this.searchFromStore;

      // supplement with the full server address
      this.mainList.map(cur => {
        cur.fullURL = `${this.$config.SERVER}${this.$config.SERVER_PORT}${cur.address}`;
      })
      console.dir(this.searchFromStore);
    }
  },

  data() {
    return {
      mainList: []
    }
  },

  mounted: function() {
    this.getTTTList();
  },

  methods: {
    onPaste() {
      // this would be for pasting items to a shelf..
      // so that they could be referenced from within
      // an individual collection
    },

    getTTTList() {
      // call server for JSON data

      this.mainList = [];
      fetch(`${this.$config.SERVER}${this.$config.SERVER_PORT}`)
        .then(response => response.json())
        .then(response => {
          // this.mainList = response;

          response.map(cur => {
            const newObj = cur;
            // might change..
            newObj.fullURL = `${cur.address}`;

            console.dir(newObj);
            this.mainList.push(newObj);
          })
          console.dir(response);
        })
        .catch(err => {
          console.log(err);
        });
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

    doDrop(args) {
      args.preventDefault();
      const link = args.dataTransfer.getData("Text");

      // same idea for this as paste:
      // this would be for putting links on a shelf..
      // so that they could be referenced from within
      // an individual collection
    }
  }
}
</script>

<style lang="stylus">
@import '../stylus/main'
</style>