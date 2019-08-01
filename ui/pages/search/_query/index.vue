<template>
  <stories-preview-list
    :filter-by="filterBy"
    :show-actions="true"
  />
</template>

<script>
import StoriesPreviewList from '~/components/StoriesPreviewList'
import debug from 'debug'
const log = debug('app:pages/search/_query/index')

export default {
  components: {
    StoriesPreviewList
  },
  layout: 'default-protected',
  data() {
    return {
      filterBy: {}
    }
  },
  created: function() {
    log('in created, search query:', this.$route.params.query)
    this.filterBy.byKeywords = this.$route.params.query ? this.$route.params.query.split(/[ ,]+/).filter(Boolean) : this.$route.params.query
  },
  mounted: function() {
    this.$nextTick(() => {
      log('in mounted, search query:', this.$route.params.query)
    })
  }
}
</script>
