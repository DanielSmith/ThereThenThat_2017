<template>

  <v-layout row wrap>
    <v-flex xs12 sm6 md4>
      <v-date-picker v-model="date"></v-date-picker>
    </v-flex>

    <v-flex xs12 sm6 md4>
      <v-time-picker v-model="time"></v-time-picker>
    </v-flex>
  </v-layout>
</template>

<script>
export default {

  data() {
    return {
      date: '',
      time: ''
    }
  },

  watch: {
    date() {
      console.log(this.date);
      this.$store.dispatch('dateUpdate', this.date);
    },

    time() {
      console.log(this.time);
      this.$store.dispatch('timeUpdate', this.time);
    }
  }
}
</script>

<style>
</style>