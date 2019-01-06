<template>
  <div>
    <div v-if="hasBookUrl">
      <v-card>
        <v-responsive :aspect-ratio="16/9">
          <v-card-text>
            <!--pages: {{ pages.length }}-->
            <div class="pdf-document">
              <pdf-page
                v-for="page in pages"
                v-bind="{page, scale}"
                :key="page.pageNumber"
                @rendered="onPageRendered"
                @errored="onPageErrored"
              />
            </div>
          </v-card-text>
        </v-responsive>
      </v-card>
    </div>
    <img
      v-else
      class="card-img-top"
      src="/img/missing-image.png">
  </div>
</template>

<script>
  import { EventBus } from '~/utils/event-bus.js'
  import range from 'lodash/range'
  import PdfPage from './PdfPage'
  import debug from 'debug'
  const log = debug('app:components/PdfContainer')

  export default {
    name: 'PdfContainer',
    components: {
      PdfPage
    },
    props: {
      bookSrc: {
        type: String,
        required: true
      }
    },
    data () {
      return {
        tmp: 'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/AnIrishAirmanForeseesHisDeath.pdf?alt=media&token=917a10a9-b2db-40c0-adbe-577efde55c52',
        scale: 2,
        pdf: undefined,
        pages: [],
        mutableBookSrc: null
      }
    },
    computed: {
      hasBookUrl: function () {
        log('pdf container this.bookSrc', this.mutableBookSrc)
        if (this.mutableBookSrc) {
          return true
        } else {
          return false
        }
      }
    },
    watch: {
      pdf (pdf) {
        log('inside pdf watch', pdf.numPages)
        this.pages = []
        log('range:', range(1, pdf.numPages))


        const promises = range(1, pdf.numPages + 1).map(number => {
          log('inside range..........................', number)
          const p = pdf.getPage(number)
          log('p:', p)
          return p
        })

        Promise.all(promises).then(pages => {
          log('in promises all then', pages.length)
          this.pages = pages
        })
      }
    },
    mounted: function () {
      log('pdf container mounted')

      this.$nextTick(() => {
        EventBus.$on('initPdf', () => {
          this.init()
        })

        EventBus.$on('pdf-book-src', src => {
          this.createBook(src)
        })
      })
    },
    beforeDestroy () {
      EventBus.$off('initPdf')
      EventBus.$off('pdf-book-src')
    },
    methods: {
      init () {
        log('in pdf init')
        if (this.bookSrc) {
          this.createBook(this.bookSrc)
        }
      },
      createBook (src) {
        log('In pdf create book', src)

        if (src) {
          this.mutableBookSrc = src

          log('A this.mutableBookSrc:', this.mutableBookSrc)
          // this.fetchPDF(this.tmp).then(pdf => {
          this.fetchPDF(this.mutableBookSrc).then(pdf => {
            log('pdf fetched')
            this.pdf = pdf

          }).catch(error => {
              log('error fetching pdf', error)
            })
        }
      },
      fetchPDF (url) {
        log('fetch pdf', url)
        return import('pdfjs-dist/webpack').then(pdfjs => pdfjs.getDocument(url))
      },

      // onPageRendered({text, page}) {
      onPageRendered(page) {
        log('on page rendered:', page)
      },

      onPageErrored({text, response, page}) {
        log('on page errored:', text, response, page)
      }
    }
  }
</script>


<style scoped>
  .pdf-document {
    /*position: fixed;*/
    position: relative;
    /*overflow: scroll;*/
    width: 100%;
    height: 90%;
  }
</style>
