<template>
  <div>
    <v-card
      v-if="showThumbnail"
      flat
      @click.stop="mutableDialog = true"
    >
      <v-layout
        justify-center
        class="pdf-thumbnail-container"
      >
        <pdf-page
          v-if="pdfPages.length > 0"
          :page="firstPage"
          :height="canvasHeightThumbnail"
          :scale="scaleThumbnail"
          class="pdf-thumbnail-document"
          @errored="onPageErrored"
          @rendered="onPageRendered"
        />
      </v-layout>
    </v-card>

    <v-dialog
      v-model="mutableDialog"
      fullscreen
    >
      <v-card flat>
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
          justify-start
          fill-height
          class="pdf-container"
        />
        <pdf-page
          v-for="pdfPage in pdfPages"
          :key="pdfPage.pageNumber"
          :page="pdfPage"
          :scale="scale"
          class="pdf-document"
          @errored="onPageErrored"
          @rendered="onPageRendered"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import debug from 'debug'
import range from 'lodash/range'
import PdfPage from './PdfPage'
// import { EventBus } from '~/utils/event-bus.js'
const log = debug('app:components/PageDetailBookPdf')

export default {
  name: 'PageDetailBookPdf',
  components: {
    PdfPage
  },
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
      mutableDialog: this.dialog,
      scale: 2,
      scaleThumbnail: 1,
      canvasHeightThumbnail: 500,
      pdf: undefined,
      pdfPages: []
    }
  },
  computed: {
    firstPage: function() {
      return this.pdfPages[0]
    }
  },
  watch: {
    pdf(pdf) {
      log('inside pdf watch', pdf.numPages)
      this.pdfPages = []
      // log('range:', range(1, pdf.numPages))

      const promises = range(1, pdf.numPages + 1).map(number => {
        // log('inside range..........................', number)
        const p = pdf.getPage(number)
        // log('p:', p)
        return p
      })

      Promise.all(promises).then(pdfPages => {
        // log('in promises all then', pdfPages.length)
        this.pdfPages = pdfPages
      })
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      // EventBus.$on(`open-page-detail-book-pdf-dialog`, () => {
      //   log('in open-page-detail-book-pdf-dialog')
      //   this.dialog = true
      //   this.init()
      // })

      this.init()
    })
  },
  beforeDestroy() {
    // EventBus.$off(`open-page-detail-book-pdf-dialog`)
  },
  methods: {
    init() {
      log('In pdf create book', this.src)

      if (this.src) {
        this.fetchPDF(this.src)
          .then(pdf => {
            log('pdf fetched')
            this.pdf = pdf
          })
          .catch(error => {
            log('error fetching pdf', error)
          })
      }
    },
    fetchPDF(url) {
      log('fetch pdf', url)
      return import('pdfjs-dist/webpack').then(pdfjs => pdfjs.getDocument(url))
    },
    onPageRendered(page) {
      // log('on page rendered:', page)
    },

    onPageErrored({ text, response, page }) {
      log('on page errored:', text, response, page)
    }
  }
}
</script>

<style>
.pdf-thumbnail-container {
  background-color: #e2e2e2;
  cursor: pointer;
  /*max-height: 300px;*/
}

.pdf-thumbnail-document {
  /*background-color: white;*/
  /*color: black;*/
  /*font-size: 1em;*/
  /*max-height: 100%;*/
}

.pdf-container {
}

.pdf-document {
}
</style>
