<template>
  <v-layout
    align-center
    justify-center
    class="medium-viewer-quote-container pt-6"
  >
    <page-detail-quote-capture
      v-model="quote"
      :theme="theme" />
  </v-layout>
</template>

<script>

// import debug from 'debug'
import MediumViewerMixin from '../mixins/MediumViewerMixin'
import PageDetailQuoteCapture from '~/components/PageDetailQuoteCapture'
// const log = debug('app:components/MediumViewerQuote')

export default {
  name: 'MediumViewerQuote',
  components: {
    PageDetailQuoteCapture
  },
  mixins: [MediumViewerMixin],
  props: {
    origin: {
      type: String,
      default: 'page'
    },
    theme: {
      type: String,
      default: 'primary'
    },
    value: {
      type: Object,
      required: true
    }
  },
  computed: {
    quote: {
      get () {
        return this.value
      },
      set (quote) {
        this.$emit('input', quote)
      }
    }
  }
}
</script>
<style scoped>
.medium-viewer-quote-container {
  /*display: block;*/
  /*overflow-y: scroll;*/
  /*height: 100vh;*/
}

/*.medium-viewer-image-container img {*/
/*  max-height: calc(100vh - 48px);*/
/*  !*margin: 0 auto;*!*/
/*  !*display: block;*!*/
/*  !*max-width: 100%;*!*/
/*}*/

</style>
