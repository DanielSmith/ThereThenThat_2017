/*
**  datefns.js - simple Vue.js wrapper for date-fns
*/
import datefns from 'date-fns';

export default {
  install: function(Vue, name = '$datefns') {
    Object.defineProperty(Vue.prototype, name, { value: datefns });
  }
}