<template>
  <v-layout
    justify-center
    class="medium-viewer-book-container"
  >
    <!--    <v-flex xs12>-->
    <pdf-container
      v-show="isPdf(mutableFileType)"
      :origin="origin"
      :src="src"
      :file-type="mutableFileType"
    />
    <epub-container
      v-show="isEpub(mutableFileType)"
      :origin="origin"
      :src="src"
      :file-type="mutableFileType"
    />
    <v-card v-if="!isPdf(mutableFileType) && !isEpub(mutableFileType)" flat>
      <v-responsive :aspect-ratio="16/9">
        <v-card-text>
          Use the upload button to add a book to your page
        </v-card-text>
      </v-responsive>
    </v-card>
    <!--    </v-flex>-->
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
  data() {
    return {
      mutableFileType: this.fileType
    }
  },
  watch: {
    src: function(newValue, oldValue) {
      log('src has changed')
      // this.mutableSrc = newValue
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      log('in medium viewer book mounted', this.src)

      EventBus.$on(`upload-preview-updated-${this.origin}`, ({ file }) => {
        log('in update book', this.origin, this.isBook(file.type))
        if (this.isBook(file.type)) {
          this.mutableFileType = file.type
        }
      })
    })
  },
  beforeDestroy() {
    EventBus.$off(`upload-preview-updated-${this.origin}`)
  }
}
</script>
<style>
.medium-viewer-book-container {
  /*overflow-y: scroll;*/
  /*height: 100vh;*/
}

.medium-viewer-book-container img {
  /*margin: 0 auto;*/
  /*display: block;*/
}
</style>
