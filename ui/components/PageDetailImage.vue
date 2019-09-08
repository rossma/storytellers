<template>
  <div>
    page image
  </div>
</template>

<script>
// import debug from 'debug'
// const log = debug('app:components/PageDetailImage')

export default {
  name: 'PageDetailImage',
  components: {
  },
  props: {
    page: {
      type: Object,
      required: true
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {

    }
  },
  computed: {

  },
  methods: {

  }
}
</script>

<style>
.v-image {
  /*cursor: pointer;*/
  /*max-height: 500px;*/
}
</style>
