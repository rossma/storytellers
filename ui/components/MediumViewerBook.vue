<template>
  <v-layout
    justify-center
    class="medium-viewer-book-container"
  >
    <pdf-container
      v-show="isPdf"
      :book-src="bookSrc"
    />
    <epub-container
      v-show="isEpub"
      :book-src="bookSrc"
    />
    <img
      v-show="!isPdf && !isEpub"
      class="card-img-top"
      src="/img/missing-image.png"
    >
  </v-layout>
</template>

<script>
import { EventBus } from '~/utils/event-bus.js'
import EpubContainer from './EpubContainer'
import PdfContainer from './PdfContainer'
import debug from 'debug'

const log = debug('app:components/MediumViewerBook')

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
  },
  data() {
    return {
      fileType: null,
      src: null
    }
  },
  computed: {
    isEpub: function() {
      log('in computed isEpub', this.previewBookType)
      log('in computed isEpub', this.previewBookType.includes('epub'))
      return this.previewBookType.includes('epub')
    },
    isPdf: function() {
      log('in computed inPdf', this.previewBookType)
      return this.previewBookType.includes('application/pdf')
    },
    previewBookType: function() {
      log('file type:', this.fileType)
      log('book type:', this.bookType)
      if (this.fileType) {
        return this.fileType
      } else {
        return this.bookType
      }
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      log('in medium viewer book mounted')
      EventBus.$on('book-src', ({ fileType, src }) => {
        log('book-src event fileType', fileType)
        log('book-src event src', src)
        this.src = src
        this.fileType = fileType
        log('book-src event', this.previewBookType)

        if (this.previewBookType.includes('application/pdf')) {
          log('sending pdf event')

          EventBus.$emit('pdf-book-src', src)
        } else if (this.previewBookType.includes('application/epub')) {
          log('sending EPUB event')

          // default is epub
          EventBus.$emit('epub-book-src', src)
        }
      })

      EventBus.$on('init-book', src => {
        log('init-book event')
        this.initBook()
      })
    })
  },
  beforeDestroy() {
    EventBus.$off('book-src')
    EventBus.$off('init-book')
  },
  methods: {
    initBook() {
      log('inisde init book', this.bookSrc)

      if (this.isEpub) {
        log('emitting event to init ebook')
        EventBus.$emit('init-ebook')
      } else if (this.isPdf) {
        log('emitting event to init pdf')
        EventBus.$emit('init-pdf')
      } else {
        log('Unsupported file type:', this.previewBookType)
      }
    }
    // isEpub(type) {
    //   return type && type.startsWith('application/epub')
    // },
    // isPdf(type) {
    //   return type && type.startsWith('application/pdf')
    // }
  }
}
</script>
<style>
.medium-viewer-book-container {
  display: block;
}

.medium-viewer-book-container img {
  margin: 0 auto;
  display: block;
}
</style>
