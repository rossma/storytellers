<template>
  <v-layout
    justify-center
    class="medium-viewer-book-container"
  >
    <img
      v-if="!bookSrc"
      class="card-img-top"
      src="/img/missing-image.png"
    >
    <pdf-container
      v-else-if="bookType === 'application/pdf'"
      :book-src="bookSrc"
    />
    <epub-container
      v-else
      :book-src="bookSrc"
    />
  </v-layout>
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
<style>
.medium-viewer-book-container {
  display: block;
}
</style>
