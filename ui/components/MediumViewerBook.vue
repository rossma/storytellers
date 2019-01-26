<template>
  <div class="medium-viewer-book-container">
    <pdf-container
      v-if="bookType === 'application/pdf'"
      :book-src="bookSrc" />
    <epub-container
      v-else
      :book-src="bookSrc" />
  </div>
</template>

<script>
import EpubContainer from './EpubContainer'
import PdfContainer from './PdfContainer'

export default {
  name: 'MediumViewerBook',
  components: {
    EpubContainer,
    PdfContainer
  },
  props: {
    bookSrc: {
      type: String,
      required: true
    },
    bookType: {
      type: String,
      required: true
    }
  }
}
</script>
