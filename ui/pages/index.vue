<template>
  <stories-preview-list :filter-by="filterBy" />
</template>

<script>
  import StoriesPreviewList from '~/components/StoriesPreviewList'

  export default {
    components: {
      StoriesPreviewList
    },
    layout: 'default-protected',
    data () {
      return {
        filterBy: {}
      }
    }
  }
</script>
