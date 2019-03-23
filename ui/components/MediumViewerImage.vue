<template>
  <v-layout
    justify-center
    style="border:1px solid blue;"
    class="medium-viewer-image-container"
  >
    <img
      v-show="imageSrc"
      :src="imageSrc"
      class="card-img-top"
    >
    <img
      v-show="!imageSrc"
      class="card-img-top"
      src="/img/missing-image.png"
    >
  </v-layout>
</template>

<script>
export default {
  name: 'MediumViewerImage',
  components: {},
  props: {
    imageSrc: {
      type: String,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {},
  methods: {}
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
