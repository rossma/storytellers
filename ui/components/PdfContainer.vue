<template>
<!--  <v-card flat>-->
    <v-responsive :aspect-ratio="16/9">
<!--      <v-card-text>-->
        <!--pages: {{ pages.length }}-->
<!--        <div class="pdf-document">-->
<!--        <v-layout-->
<!--          justify-start-->
<!--          align-center-->
<!--          row-->
<!--          class="pdf-document">-->
          <pdf-page
            v-for="page in pages"
            :key="page.pageNumber"
            v-bind="{page, scale}"
            @errored="onPageErrored"
            @rendered="onPageRendered"
          />
<!--        </v-layout>-->
<!--        </div>-->
<!--      </v-card-text>-->
    </v-responsive>
<!--  </v-card>-->
</template>

<script>
import FileUtils from '~/utils/file'
import { EventBus } from '~/utils/event-bus.js'
import range from 'lodash/range'
import debug from 'debug'
import PdfPage from './PdfPage'

const log = debug('app:components/PdfContainer')

export default {
  name: 'PdfContainer',
  components: {
    PdfPage
  },
  props: {
    origin: {
      type: String,
      default: 'page'
    },
    src: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      scale: 2,
      pdf: undefined,
      pages: []
    }
  },
  watch: {
    pdf(pdf) {
      log('inside pdf watch', pdf.numPages)
      this.pages = []
      // log('range:', range(1, pdf.numPages))

      const promises = range(1, pdf.numPages + 1).map(number => {
        // log('inside range..........................', number)
        const p = pdf.getPage(number)
        // log('p:', p)
        return p
      })

      Promise.all(promises).then(pages => {
        // log('in promises all then', pages.length)
        this.pages = pages
      })
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      if (FileUtils.isPdf(this.fileType)) {
        this.init(this.src)
      }

      EventBus.$on(`upload-preview-updated-${this.origin}`, ({ file }) => {
        log('in update pdf', this.origin, FileUtils.isPdf(file.type))
        if (FileUtils.isPdf(file.type)) {
          this.update(file)
        }
      })
    })
  },
  beforeDestroy() {
    EventBus.$off(`upload-preview-updated-${this.origin}`)
  },
  methods: {
    init(src) {
      log('in pdf init', src)
      if (src) {
        this.createBook(src)
      }
    },
    createBook(src) {
      log('In pdf create book', src)

      if (src) {
        this.fetchPDF(src)
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
    update(file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        this.init(reader.result)
      }

      reader.readAsArrayBuffer(file)
    },
    // onPageRendered({text, page}) {
    onPageRendered(page) {
      // log('on page rendered:', page)
    },

    onPageErrored({ text, response, page }) {
      log('on page errored:', text, response, page)
    }
  }
}
</script>


<style scoped>
.pdf-document {
  /*border: 3px solid red;*/
}
</style>
