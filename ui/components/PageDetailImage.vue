<template>
  <div>
    <v-img
      v-if="showThumbnail"
      :src="src"
      class="image-thumbnail"
      @click.stop="mutableDialog = true"
    />
    <v-dialog
      v-model="mutableDialog"
      scrollable
      fullscreen
      hide-overlay
    >
      <v-card fill-height dark>
        <v-btn
          color="grey"
          dark
          fab
          icon
          fixed
          @click="mutableDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-layout
          dark
          align-center
          justify-center
          class="image-container"
        >
          <v-img
            :src="src"
            max-height="100vh"
            max-width="100vh"
            contain />
        </v-layout>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// import debug from 'debug'
// const log = debug('app:components/PageDetailImage')
// import { EventBus } from '~/utils/event-bus.js'

export default {
  name: 'PageDetailImage',
  components: {},
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    page: {
      type: Object,
      required: true
    },
    showThumbnail: {
      type: Boolean,
      default: true
    },
    src: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'primary'
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      mutableDialog: this.dialog
    }
  },
  computed: {},
  mounted: function() {
    this.$nextTick(() => {
      // EventBus.$on(`open-page-detail-image-dialog`, () => {
      //   this.dialog = true
      // })
    })
  },
  beforeDestroy() {
    // EventBus.$off(`open-page-detail-image-dialog`)
  },
  methods: {
    openImageDialog() {}
  }
}
</script>

<style>
.v-image {
  /*cursor: pointer;*/
  /*max-height: 500px;*/
}
.image-container {
  /*display: block;*/
  /*overflow-y: scroll;*/
  /*height: 100vh;*/
}

.image-container img {
  /*margin: 0 auto;*/
  /*display: block;*/
  /*max-width: 100%;*/
}

.image-thumbnail {
  cursor: pointer;
  max-height: 500px;
}
</style>
