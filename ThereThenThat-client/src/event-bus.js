/*
**  event-bus.js
*/

import Vue from 'vue'

export const eventBus = new Vue({
  methods: {
    mapFocus() {
      this.$emit('mapFocus');
    }
  }
});
