<template>
  <v-layout
    justify-center
    class="medium-viewer-image-container"
  >
    <img
      v-show="mutableSrc"
      :src="mutableSrc"
      class="card-img-top"
    >
    <img
      v-show="!mutableSrc"
      class="card-img-top"
      src="/img/missing-image.png"
    >
  </v-layout>
</template>

<script>
import { EventBus } from '~/utils/event-bus.js'

import debug from 'debug'
import MediumViewerMixin from '../mixins/MediumViewerMixin'
const log = debug('app:components/MediumViewerImage')

export default {
  name: 'MediumViewerImage',
  components: {},
  mixins: [MediumViewerMixin],
  props: {
    origin: {
      type: String,
      default: 'page'
    },
    src: {
      type: String,
      default: ''
    }
  },
  watch: {
    src: function(newValue, oldValue) {
      this.mutableSrc = newValue
    }
  },
  data() {
    return {
      mutableSrc: null
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      log('in medium viewer image mounted', this.src)

      this.mutableSrc = this.src

      EventBus.$on('upload-preview-updated', ({ origin, file }) => {
        log('in preview upload', this.origin, origin, this.isImage(file.type))
        if (this.origin === origin && this.isImage(file.type)) {
          log('origins are the same and is an image')
          this.init(file)
        }
      })
    })
  },
  beforeDestroy() {
    EventBus.$off('upload-preview-updated')
  },
  methods: {
    init(file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        this.mutableSrc = reader.result
      }

      reader.readAsDataURL(file)
    }
  }
}
</script>
<style scoped>
.medium-viewer-image-container {
  display: block;
}

.medium-viewer-image-container img {
  margin: 0 auto;
  display: block;
  max-width: 100%;
}
</style>
