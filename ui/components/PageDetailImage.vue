<template>
  <div>
    <v-img
      :src="src"
      class="image-thumbnail"
      @click.stop="dialog = true"
    />
    <v-dialog
      v-model="dialog"
      scrollable
      fullscreen
    >
      <v-card>
        <v-layout
          justify-center
          class="image-container"
          tabindex="-1"
        >
          <v-img :src="src" />
        </v-layout>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// import debug from 'debug'
// const log = debug('app:components/PageDetailImage')

export default {
  name: 'PageDetailImage',
  components: {},
  props: {
    page: {
      type: Object,
      required: true
    },
    src: {
      type: String,
      required: true
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialog: false
    }
  },
  computed: {},
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
