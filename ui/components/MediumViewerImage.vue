<template>
  <div>
    <img
      v-show="imageSrc"
      :src="imageSrc"
      class="card-img-top">
    <img
      v-show="!imageSrc"
      class="card-img-top"
      src="/img/missing-image.png">
  </div>
</template>

<script>

export default {
  name: 'MediumViewerImage',
  components: {
  },
  props: {
    imageSrc: {
      type: String,
      required: true
    }
  },
  data () {
    return {
    }
  },
  computed: {

  },
  methods: {

  }
}
</script>

