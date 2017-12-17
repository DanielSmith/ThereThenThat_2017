<template>
  <div>
  <p>
    {{ allData.data.title }}
  </p>
  <p>
    <a :href="allData.data.url" target="fromTTT">{{ allData.data.url }}</a>
  </p>
  <p>
    {{ allData.data.description }}
  </p>
  </div>
</template>

<script>
  export default {
   props: ['itemPath', 'allData'] 
  }
</script>
