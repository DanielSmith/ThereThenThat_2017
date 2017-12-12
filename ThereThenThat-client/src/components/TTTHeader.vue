<template>
  <v-toolbar class="indigo darken-4" app dark>
    <v-toolbar-title><a href="/">ThereThenThat</a><span class="titlePad"></span> {{ context }} </v-toolbar-title>
    <v-spacer></v-spacer>

  </v-toolbar>
</template>

<script>
export default {
  name: 'TTTHeader',
  props: ['context'] 
}
</script>

<style scoped>
a {
  text-decoration: none;
  color: #ffffff;
}

.titlePad {
  display: inline-block;
  width: 30px;
}
</style>