<template>
  <preview-list
    name="PreviewList"
    :filter-by="filterBy" />
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
