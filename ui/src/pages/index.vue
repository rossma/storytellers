<template>
  <preview-list name="PreviewList" v-bind:filterBy="filterBy"></preview-list>
</template>

<script>
  import PreviewList from '~/components/preview/PreviewList'

  export default {
    components: {
      PreviewList
    },
    data () {
      return {
        filterBy: {}
      }
    }
  }
</script>

