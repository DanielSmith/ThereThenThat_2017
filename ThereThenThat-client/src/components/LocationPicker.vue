<template>
  <v-card flat>
    <div id="map"></div>
  </v-card>
</template>

<script>
import Vue from 'vue'
import { mapMutations, mapActions, mapGetters, mapState } from 'vuex';
import { eventBus } from '../event-bus';

export default {
  data() {
    return {

      // perhaps move this to config
      DEFAULT_ZOOM: 16,
      DEFAULT_LAT_LNG: {
        lat: 37.795,
        lng: -122.393
      },
      map: null
    }
  },


  computed: {
   ...mapGetters({
      updateCenter: 'getMyCenter'
    })
  },

  watch: {
    updateCenter() {
      this.map.setCenter(this.updateCenter);
      this.map.setZoom(this.DEFAULT_ZOOM);
      this.setMapMarker(this.updateCenter);
      return this.updateCenter;
    }
  },


  methods: {
    ...mapActions([
      'updateMap'
    ]),

    initMap() {
      this.geocoder = new google.maps.Geocoder();
      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: this.DEFAULT_ZOOM,
        center: this.DEFAULT_LAT_LNG,
        gestureHandling: 'greedy'
      });

      google.maps.event.trigger(this.map, 'resize')
      google.maps.event.addListener(this.map, 'click', (e) => {
        let lat = e.latLng.lat();
        let lng = e.latLng.lng();
        let latlng = {lat: lat, lng: lng };


        this.$store.dispatch('mapUpdate', latlng);
        this.geocoder.geocode({'location': latlng}, (results, status) => {

          if (status === 'OK') {
            if (results[0]) {

              this.$store.dispatch('addressUpdate', results[0].formatted_address);
              this.theLocation = results[0].formatted_address;
              this.setMapMarker(latlng);
            } else {
              window.alert('No results found');
            }
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }
        });
      });

      google.maps.event.addDomListener(window, 'resize', () => {
        google.maps.event.trigger(this.map, 'resize')

        this.map.setZoom(this.DEFAULT_ZOOM);
      });

    },

    setMapMarker(latlng) {
      let marker = new google.maps.Marker({
        position: latlng,
        map: this.map
      });
    },

    setPlace(place) {
      this.place = place;

      this.center.lat = this.place.geometry.location.lat();
      this.center.lng = this.place.geometry.location.lng();
    }
  },


  mounted: function() {
    let s = this;

    setTimeout(() => {
      s.initMap();
    }, 200);

    // eventBus items
    eventBus.$on('mapFocus', () => {
      google.maps.event.trigger(this.map, 'resize');
    });
  }
}
</script>

<style>
#map {
  width: 500px;
  height: 500px;
}

@media(max-height:850px) {
  #map {
    width: 200px;
    height: 200px;
  }
}

</style>