<template>
  <v-layout
    justify-center
    class="medium-viewer-book-container"
  >
    <pdf-container
      v-show="isPdf(mutableFileType)"
      :origin="origin"
      :src="src"
      :fileType="mutableFileType"/>
    <epub-container
      v-show="isEpub(mutableFileType)"
      :origin="origin"
      :src="src"
      :fileType="mutableFileType"/>
    <v-flex v-if="!isPdf(mutableFileType) && !isEpub(mutableFileType)">
      <v-card flat>
        <v-responsive :aspect-ratio="16/9">
          <v-card-title primary-title>
            There aren't any uploaded books yet
          </v-card-title>
        </v-responsive>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { EventBus } from '~/utils/event-bus.js'
import debug from 'debug'
import MediumViewerMixin from '../mixins/MediumViewerMixin'
import EpubContainer from './EpubContainer'
import PdfContainer from './PdfContainer'

const log = debug('app:components/MediumViewerBook')

export default {
  name: 'MediumViewerBook',
  components: {
    EpubContainer,
    PdfContainer
  },
  mixins: [MediumViewerMixin],
  props: {
    origin: {
      type: String,
      default: 'page'
    },
    src: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: ''
    }
  },
  watch: {
    src: function(newValue, oldValue) {
      log('src has changed')
      // this.mutableSrc = newValue
    }
  },
  data() {
    return {
      mutableFileType: this.fileType
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      log('in medium viewer book mounted', this.src)

      EventBus.$on('upload-preview-updated', ({ origin, file }) => {
        log('in update book', this.origin, origin, this.isBook(file.type))
        if (this.origin === origin && this.isBook(file.type)) {
          this.mutableFileType = file.type
        }
      })
    })
  },
  beforeDestroy() {
    EventBus.$off('upload-preview-updated')
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
