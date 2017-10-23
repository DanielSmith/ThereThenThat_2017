<template>
  <div>
    <audio controls :src="itemPath"></audio>
  </div>
</template>

<script>
  export default {
   props: ['itemPath'] 
  }
</script>

<style scoped>
</style>