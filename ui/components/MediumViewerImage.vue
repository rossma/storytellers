<template>
  <v-layout
    justify-center
    class="medium-viewer-image-container"
    tabindex="-1"
  >
    <img
      v-show="mutableSrc"
      :src="mutableSrc"
      class="card-img-top"
    >
<!--    <img-->
<!--      v-show="!mutableSrc"-->
<!--      class="card-img-top"-->
<!--      src="/img/missing-image.png"-->
<!--    >-->
    <v-card v-show="!mutableSrc" flat>
      <v-responsive :aspect-ratio="16/9">
        <v-card-title style="flex-direction: column">
          There aren't any uploaded images yet
        </v-card-title>
      </v-responsive>
    </v-card>
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
  data() {
    return {
      mutableSrc: null
    }
  },
  watch: {
    src: function(newValue, oldValue) {
      this.mutableSrc = newValue
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      log('in medium viewer image mounted', this.src)

      this.mutableSrc = this.src

      EventBus.$on(`upload-preview-updated-${this.origin}`, ({ file }) => {
        log('in preview upload', this.origin, this.isImage(file.type))
        if (this.isImage(file.type)) {
          log('origins are the same and is an image')
          this.init(file)
        }
      })
    })
  },
  beforeDestroy() {
    EventBus.$off(`upload-preview-updated-${this.origin}`)
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
  overflow-y: scroll;
  height: 100vh;
}

.medium-viewer-image-container img {
  margin: 0 auto;
  display: block;
  max-width: 100%;
}
</style>
