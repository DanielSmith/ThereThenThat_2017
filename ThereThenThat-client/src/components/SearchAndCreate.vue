<template>
  <div>
    <v-layout row pb-2>
      <v-flex xs4 pr-3>

          <!--
              yes, placeholder is a space... it makes Google Autocomplete happy..
          -->
          <v-text-field
            solo
            @focus="locFocus"
            @paste.stop="inputPaste"
            label="Location"
            placeholder=" "
            prepend-icon="map"
            :prepend-icon-cb="this.doClearLocation"
            append-icon="close"
            v-model="theLocation"
            :append-icon-cb="this.doClearLocation"
            id="pac-input"
          >
          </v-text-field>
      </v-flex>

      <v-flex xs4 pr-3>
        <v-card class="primary">
          <v-text-field
            solo
            @focus="timeFocus"
            @paste.stop="inputPaste"
            label="Date & Time"
            v-model="theDateTime"
            prepend-icon="date_range"
            :prepend-icon-cb="this.doClearDateTime"
            append-icon="close"
            :append-icon-cb="this.doClearDateTime"
            id="datetime-input"
            ></v-text-field>
        </v-card>
      </v-flex>

      <v-flex xs4>
        <v-card class="primary">
          <v-text-field
            solo
            ignoreThis="location"
            @focus="tagFocus"
            @paste.stop="inputPaste"
            label="Tags"
            v-model="theTags"
            prepend-icon="local_offer"
            :prepend-icon-cb="this.doClearTags"
            append-icon="close"
            :append-icon-cb="this.doClearTags"
            id="tags-input"
            ></v-text-field>
        </v-card>
      </v-flex>
    </v-layout>

    <v-spacer></v-spacer>

    <v-layout row wrap pb-4 v-if="showSearchCreate">
      <v-flex xs2 text-xs-center>
        <v-btn fab primary dark
          @click="closeSearchCreate"
        >
          <v-icon>close</v-icon>
        </v-btn>

      </v-flex>
      <v-flex xs6 offset-xs4 text-xs-center>
        <v-btn large primary dark
          @click="searchClick"
        >Search</v-btn>
        <v-btn large primary dark
          @click="createClick"
        >Create</v-btn>
      </v-flex>
    </v-layout>

<transition name="expand">
    <v-layout row wrap custom_tab_height v-if="isFocused">

      <v-tabs dark fixed centered v-model="active">
        <v-tabs-items>
          <v-tabs-content
            :key="1"
            :id="'tab-' + 1"
          >
            <v-card flat>
              <LocationPicker></LocationPicker>
            </v-card>
          </v-tabs-content>

          <v-tabs-content
            :key="2"
            :id="'tab-' + 2"
          >
            <TimePicker></TimePicker>
          </v-tabs-content>

          <v-tabs-content
            :key="3"
            :id="'tab-' + 3"
          >
            <v-card flat>
              <h4>Recent Tags</h4>
            </v-card>
          </v-tabs-content>

        </v-tabs-items>
      </v-tabs>
    </v-layout>
</transition>
  </div>
</template>

<script>
import TimePicker from '@/components/TimePicker'
import LocationPicker from '@/components/LocationPicker'
import TagPicker from '@/components/TagPicker'

import datefns from 'date-fns'
import { mapMutations, mapActions, mapGetters, mapState } from 'vuex';
import { eventBus } from '../event-bus.js';

import axios from 'axios';

export default {
  name: 'SearchPickers',

  components: {
    TimePicker,
    LocationPicker,
    TagPicker
  },

  computed: {
   ...mapGetters({
      addressFromMap: 'getMyAddress',
      latLngUpdated: 'getMyLatLng',
      dateTimeFromPicker: 'getMyDateTime',
      dateISO: 'getMyISODate',

      theDate: 'getMyDate',
      theTime: 'getMyTime',
    })
  },


  watch: {
    // update our text input if the map is clicked...
    addressFromMap() {
      this.theLocation = this.addressFromMap;
    },

    latLngFromMap() {
      this.lat = this.latLngUpdated.lat;
      this.lng = this.lngLngUpdated.lat;  
    },
    
    latLngUpdated() {
      this.lat = this.latLngUpdated.lat;
      this.lng = this.latLngUpdated.lng;
    },

    dateTimeFromPicker() {
      this.theDateTime = this.dateTimeFromPicker;
    },

    theLocation() {
      this.checkLocationInput();
    },

    theDateTime() {
      this.checkDateTimeInput();
    },

    theTags() {
      this.checkTagsInput();
    }
  },

  data() {
    return {
      autocomplete: null,
      place: null,
      map: null,
      geocoder: null,
      active: null,

      isFocused: false,
      showSearchCreate: false,

      theLocation: "",
      theAddress: "",
      theDateTime: "",
      theDateISO: "",
      theTags: "",

      lat: null,
      lng: null,

      locationInputClear: null,
      dateTimeInputClear: null,
      tagsInputClear: null,

      curTab: '',
      description: 'san francisco',
      tabItems: ['There', 'Then', 'That'],

      clipped: false,
      drawer: true,
      fixed: false,
      items: [
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js',

      // this really should be in some sort of global config
      SERVER_HOST: 'localhost',
      SERVER_PORT: '3100',

      mainList: []
    }
  },


  mounted: function() {
    const rightNow = new Date();

    this.locationInputClear = document.getElementById('pac-input').nextSibling;
    this.dateTimeInputClear = document.getElementById('datetime-input').nextSibling;
    this.tagsInputClear = document.getElementById('tags-input').nextSibling;

    this.checkLocationInput();
    this.checkDateTimeInput();
    this.checkTagsInput();

    this.$store.commit('dateUpdate', datefns.format(rightNow, 'YYYY-MM-DD'));
    this.$store.commit('timeUpdate', datefns.format(rightNow, 'h:ma'));

    let s = this;

    setTimeout(() => {
      s.initMapAutocomplete();
      }, 500);
    },

  methods: {
    checkLocationInput() {
      this.checkInputClear(this.theLocation, this.locationInputClear);
    },

    checkDateTimeInput() {
      this.checkInputClear(this.theDateTime, this.dateTimeInputClear);
    },

    checkTagsInput() {
      this.checkInputClear(this.theTags, this.tagsInputClear);
    },

    clearOn(inputField) {
      inputField.classList.remove('hideClearField');
      inputField.classList.add('showClearField');
    },

    clearOff(inputField) {
      inputField.classList.remove('showClearField');
      inputField.classList.add('hideClearField');
    },

    checkInputClear(inputData, inputField) {
      if (inputData && inputData.length > 0) {
        this.clearOn(inputField);
      } else {
        this.clearOff(inputField);
      }
    },

    inputPaste() {
      // might want to handle this ....
      // alert('location paste');
    },

    closeSearchCreate() {
      this.showSearchCreate = false;
      this.isFocused = false;
    },

    doClearLocation() {
      this.theLocation = '';
    },

    doClearDateTime() {
      this.theDateTime = '';
    },

    doClearTags() {
      this.theTags = '';
    },

    initMapAutocomplete() {

      // may have a loading/tioming issue here
      this.geocoder = new google.maps.Geocoder();

      let clearIcon = document.getElementsByTagName('input-group__append-icon');
      let input = document.getElementById('pac-input');
      const autocomplete = new google.maps.places.Autocomplete(input);

      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();


        console.log('place changed event...');
        console.dir(place);

        if (place === null) {
          return;
        }

        if (place.geometry.location.lat && place.geometry.location.lng) {
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
        }

        this.theLocation = place.formatted_address;
        this.$store.commit('autocompletePlace', place);
      });
    },

    locFocus() {
      this.active = "tab-1";
      this.isFocused = true;
      this.showSearchCreate = true;
      eventBus.mapFocus();
    },

    timeFocus: function() {
      this.active = "tab-2";
      this.isFocused = true;
      this.showSearchCreate = true;
    },

    tagFocus: function() {
      this.active = "tab-3";
      this.isFocused = true;
      this.showSearchCreate = true;
    },

    // specific drag / drop / paste handlers for
    // Collection list - these would put items on
    // a shalf for use with a specific collection
    dragEnd: function(args) {
      args.preventDefault();
      console.dir(args);
    },

    dragOver: function(args) {
      args.preventDefault();
    },

    doDrop(args) {
      args.preventDefault();
    },

    onPaste(event) {
      event.preventDefault();
    },

    searchClick() {

      const config = { headers: { 'Content-Type': 'application/json' } };
      axios.post(`${this.$config.SERVER}${this.$config.SERVER_PORT}/api/search`, { 
        location: this.theLocation,
        time: this.theDateTime,
        tags: this.theTags
      }, config)
      .then(response => {
        const myObj = JSON.stringify(response.data.searchInfo);


        this.$store.commit('searchResultUpdate', response.data.searchInfo);
      })
      .catch(err => {
        console.log(err);
      })
    },

    createClick() {
      this.lat = this.lat || 0;
      this.lng = this.lng || 0;
      this.theAddress = this.theLocation;
      this.theLocation = `${this.lat},${this.lng}`;

      let formattedHourMin = '';
      let pickerTime = this.theTime;

      let betweenAddDate = '';
      let betweenDateTags = '';

      // put this time handling off into
      // some util function
      let isPM = false;
      if (pickerTime.indexOf('pm') > 0) {
        isPM = true;
      }

      // and drop the am or pm...
      pickerTime = pickerTime.replace(/(am|pm)/, '');

      let [hour, mins] = pickerTime.split(':');

      if (isPM && hour !== 12) {
        hour = parseInt(hour) + 12;
      }

      if (isPM === false && hour == 12) {
        hour = '0';
      }

      if (hour < 10) {
        hour = `0${hour}`;
      }

      formattedHourMin = `${hour}:${mins}`;
      const theDateTime = `${this.theDate} ${formattedHourMin}`;

      if (this.theAddress !== '' && this.theDateTime !== '') {
        betweenAddDate = ' - ';
      }
      if ((this.theAddress !== '' || this.theDateTime !== '') &&
          this.theTags !== '') {
          betweenDateTags = ' - ';
      }

      // needs location and time..
      axios.post(`${this.$config.SERVER}${this.$config.SERVER_PORT}/api/create`, { 
        location: this.theLocation,
        address: this.theAddress,
        lat: this.lat,
        lng: this.lng,
        time: theDateTime,
        tags: this.theTags,
        version: 0.3,
        people: "",
        title: `${this.theAddress}${betweenAddDate}${this.theDate}${betweenDateTags}${this.theTags}`,
        description: "test",
      })
      .then(response => {
        // do some checking on this...
        const newAddress = `${response.data.address}`;      
        this.$router.push(newAddress);
      })
      .catch(err => {
        console.log(err);
      })
    }
  }   
}
</script>

<style lang="stylus">
@import '../stylus/main'

* {
  pointer-events: auto;
}

.pac-container, .pac-item {
  width: 500px !important;
}

.pac-item, .pac-matched, .pac-item-query {
  font-size: 18px;
}

.input-group__append-icon {
  cursor: pointer;
  pointer-events: auto;
}

.showClearField {
  opacity: 1;
}

.hideClearField {
  opacity: 0;
}

.custom_tab_height {
  height: 550px;
}


/* transition stuff */
.expand-move {
  transition: all 500ms ease-in-out 500ms;
}


.expand-enter-active,
.expand-leave-active {
  transition: opacity 500ms;
}

.expand-enter,
.expand-leave-to {
  opacity: 0
}

.expand-leave,
.expand-enter-to {
  opacity: 1
}

</style>
