<template>
  <div>
    <img :src="itemPath">
  </div>
</template>

<script>
  export default {
   props: ['itemPath'] 
  }
</script>
