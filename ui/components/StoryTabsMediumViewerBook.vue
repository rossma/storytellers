<template>
  <div class="medium-viewer-book-container">
    <epub-container :book-src="bookSrc" />
  </div>
</template>

<script>

import EpubContainer from './EpubContainer'

export default {
  name: 'StoryTabsMediumViewerBook',
  components: {
    EpubContainer
  },
  props: {
    bookSrc: {
      type: String,
      required: true
    }
  }
}
</script>
