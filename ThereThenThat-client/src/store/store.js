import Vue from 'vue';
import Vuex from 'vuex';
import datefns from 'date-fns'

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    location: {
      place: '',
      address: '',
      latestLatLng: { lat: 38, lng: -122 },
      center: {}, // { lat: 38, lng: -122 },
      addressUpdated: null
    },

    time: {
      date: '',
      time: ''
    },


    tags: {

    },

    searchData: {}
  },

  getters: {
    getMyPlace: state => state.location.place,
    getMyCenter: state => state.location.center,
    getMyLatLng: state => state.location.latestLatLng,
    getMyAddress: state => state.location.address,
    // getMyAddressUpdate: state => state.location.addressUpdate,
    getMyDateTime(state) {
      return `${state.time.date} - ${state.time.time}`;
    },
    

    getMyDate: state => state.time.date,
    getMyTime: state => state.time.time,

    getMyISODate(state) {
      const parsedDate = datefns.parse(`${state.time.date} ${state.time.time}`);

      console.log(`
      parsed.............    ${parsedDate}
      
      `);

      return parsedDate;
    },

    getMySearchResult: state => state.searchData
  },


  mutations: {

    // click from map.. need to update input field
    mapUpdate(state, payload) {
      state.location.latestLatLng = payload;
    },
    
    // from autocomplete, need to update map
    addressUpdate(state, payload) {
      // need a better approcach than this.. perhaps a unique id
      // only purpose to this is so that we have a way to flag the
      // text input in another component that we made a change....
      console.log('=--------------------addressUpdate  -----  ');
      console.log(payload);

      // state.location.addressUpdated = datefns.getTime(new Date());
      state.location.address = payload;
    },


    dateUpdate(state, payload) {
      state.time.date = payload;
      console.dir(JSON.stringify(state));
    },

    timeUpdate(state, payload) {
      state.time.time = payload;
      console.dir(JSON.stringify(state));
    },

    autocompletePlace(state, payload) {
      let newCenter = {
        lat: payload.geometry.location.lat(),
        lng: payload.geometry.location.lng()
      }

      state.location.center = Object.assign({}, state.location.center, newCenter);

      console.log(state);
      console.log('==============');
    },
    
    searchResultUpdate(state, payload) {
      state.searchData = Object.assign({}, payload);
      console.log(state);
      console.log('==============');
    }
  },


  actions: {
    mapUpdate ({commit}, payload) {
      commit('mapUpdate', payload);
    },

    addressUpdate ({commit}, payload) {
      commit('addressUpdate', payload);
    },

    dateUpdate({commit}, payload) {
      commit('dateUpdate', payload);
    },

    timeUpdate({commit}, payload) {
      commit('timeUpdate', payload);
    },

    autocompletePlace({commit}, payload) {
      commit('autocompletePlace', payload);
    },
    
    searchResultUpdate({commit} , payload) {
      commit('searchResultUpdate', payload);      
    }
  },

  modules: {

  }
});
