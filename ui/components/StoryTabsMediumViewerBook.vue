<template>
  <div>
    <epub-container :book-src="bookSrc" />
    <!--<epub-container-->
      <!--:book-src="bookSrc"-->
      <!--v-show="bookSrc" />-->
    <!--<img-->
      <!--v-show="!bookSrc"-->
      <!--class="card-img-top"-->
      <!--src="/img/missing-image.png">-->
  </div>
</template>

<script>

import EpubContainer from './EpubContainer'

export default {
  name: 'StoryTabsMediumViewerBook',
  components: {
    EpubContainer
  },
  props: {
    bookSrc: {
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

