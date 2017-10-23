<template>
  <div>
    <video controls :src="itemPath"></video>
  </div>
</template>

<script>
  export default {
    props: ['itemPath']
  }
</script>

<style scoped>
</style>