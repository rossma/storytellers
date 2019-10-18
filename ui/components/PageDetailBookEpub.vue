<template>
  <div>
    <v-card
      v-if="showThumbnail"
      flat
    >
<!--      <v-responsive :aspect-ratio="16/9"> this leaves many empty spaces below -->
        <v-layout
          justify-center
          class="epub-thumbnail-container"
        >
          <div
            id="epub-thumbnail-viewer"
            ref="epub-thumbnail-viewer"
            :class="thumbnailClass"
            class="single"
          />
        </v-layout>
<!--      </v-responsive>-->
    </v-card>

    <v-dialog
      v-model="mutableDialog"
      eager
      fullscreen
    >
      <!--      <v-responsive :aspect-ratio="16/9">-->
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
          justify-center
          fill-height
          class="epub-container"
        >
          <div
            id="epub-viewer"
            ref="epub-viewer"
            :class="viewerClass"
          />
          <a
            v-show="hasPrev"
            id="prev"
            href="#prev"
            class="arrow prev"
            @click.prevent="prevPage()"
          >‹</a>
          <a
            v-show="hasNext"
            id="next"
            href="#next"
            class="arrow next"
            @click.prevent="nextPage()"
          >›</a>
        </v-layout>
      </v-card>
      <!--      </v-responsive>-->
    </v-dialog>
  </div>
</template>

<script>
import { Book, Rendition } from 'epubjs'
import debug from 'debug'
// import { EventBus } from '~/utils/event-bus.js'
const log = debug('app:components/PageDetailBookEpub')

export default {
  name: 'PageDetailBookEpub',
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
      mutableDialog: this.dialog,
      book: null,
      display: null,
      // mutableBookSrc: null,
      displayed: null,
      rendition: null,
      renditionThumbnail: null,
      nextNav: null,
      nextLabel: null,
      next: {
        textContent: null
      },
      prevNav: null,
      prevLabel: null,
      prev: {
        textContent: null
      },
      hasPrev: false,
      hasNext: false,
      spreadLayout: true,
      showme: false
    }
  },
  computed: {
    thumbnailClass: function() {
      if (this.$vuetify.breakpoint.name === 'xs') {
        return 'epub-thumbnail-document-xs'
      } else {
        return 'epub-thumbnail-document'
      }
    },
    viewerClass: function() {
      if (this.$vuetify.breakpoint.name === 'xs') {
        return 'epub-viewer-xs'
      } else {
        return 'epub-viewer'
      }
    }
  },
  watch: {},
  mounted: function() {
    this.$nextTick(() => {
      // EventBus.$on(`open-page-detail-book-epub-dialog`, () => {
      //   log('in open-page-detail-book-epub-dialog')
      //   this.dialog = true
      //   this.init()
      // })

      this.init()
    })
  },
  beforeDestroy() {
    // EventBus.$off(`open-page-detail-book-epub-dialog`)
  },
  methods: {
    init() {
      log('in pageDetailBookEpub init')
      if (this.src) {
        this.book = new Book(this.src, {})
        this.initThumbnailRendition()
      }
    },
    initThumbnailRendition() {
      // this.destroyBookThumbnail()

      this.renditionThumbnail = new Rendition(this.book, {
        height: 500,
        flow: 'paginated',
        spread: 'none'
      })

      const viewerEl = this.$refs['epub-thumbnail-viewer']
      this.renditionThumbnail.attachTo(viewerEl)

      this.renditionThumbnail.themes.override('cursor', 'pointer')
      this.renditionThumbnail.display()

      this.renditionThumbnail.on('click', () => {
        this.initDialogRendition()
        this.mutableDialog = true
      })
    },
    initDialogRendition() {
      // todo dont need to destroy book..component destroys it .. or move to destroy metbod
      // this.destroyBook()

      // if (this.book) {
      //   this.book.destroy()
      // }
      if (this.rendition) {
        this.rendition.destroy()
      }
      this.book = new Book(this.src, {})

      this.rendition = new Rendition(this.book, {
        // flow: 'paginated',
        // flow: 'scrolled-doc',
        // method: 'continuous',
        manager: 'continuous',
        flow: 'scrolled',
        width: '100%',
        height: '100%'
      })

      const viewerEl = this.$refs['epub-viewer']
      this.rendition.attachTo(viewerEl)
      this.rendition.display()
      // const hash = window.location.hash.slice(2)
      // log('hash:', hash)
      // this.rendition.display(hash || undefined)

      // this.book.ready.then(() => {
      //   const keyListener = e => {
      //     if ((e.keyCode || e.which) === 37) {
      //       this.prevPage()
      //     }
      //
      //     if ((e.keyCode || e.which) === 39) {
      //       this.nextPage()
      //     }
      //   }
      //
      //   this.rendition.on('keyup', keyListener)
      //   document.addEventListener('keyup', keyListener, false)
      // })
      //
      // // this.rendition.on("rendered", (section) => {
      // // })
      //

      this.book.ready.then(() => {
        const keyListener = e => {
          if ((e.keyCode || e.which) === 37) {
            this.prevPage()
          }

          if ((e.keyCode || e.which) === 39) {
            this.nextPage()
          }
        }

        this.rendition.on('keyup', keyListener)
        document.addEventListener('keyup', keyListener, false)
      })

      // this.rendition.on("rendered", (section) => {
      // })

      this.rendition.on('relocated', location => {
        this.hasNext = !location.atEnd
        this.hasPrev = !location.atStart
      })

      this.rendition.on('rendered', section => {
        this.hasNext = !!section.next()
        this.hasPrev = !!section.prev()
      })

      // this.rendition.on('layout', function(layout) {
      //   log('In Layout', this.book)
      //   log(layout.spread)
      // })
      //
      // this.rendition.on('resize', function(width, height) {
      //   log('In resize')
      //   log('Resized to:', width, height)
      // })
    },
    nextPage() {
      this.book.package.metadata.direction === 'rtl'
        ? this.rendition.prev()
        : this.rendition.next()
    },
    prevPage() {
      this.book.package.metadata.direction === 'rtl'
        ? this.rendition.next()
        : this.rendition.prev()
    },
    // destroyBookThumbnail() {
    //   if (this.book) {
    //     this.book.destroy()
    //   }
    //   if (this.renditionThumbnail) {
    //     this.renditionThumbnail.destroy()
    //   }
    // },
    // destroyBook() {
    //   if (this.book) {
    //     this.book.destroy()
    //   }
    //   if (this.rendition) {
    //     this.rendition.destroy()
    //   }
    // }
  }
}
</script>

<style>
.epub-thumbnail-container {
  background-color: #e2e2e2;
  /*max-height: 300px;*/
  /*max-width: 600px;*/
  z-index: 9999;
}

.epub-thumbnail-document, .epub-thumbnail-document-xs {

}

.epub-thumbnail-document {
  /*background-color: white;*/
  /*color: black;*/
  /*font-size: 1em;*/
  /*max-height: 100%;*/
  max-width: 600px;
}

.epub-thumbnail-document-xs {
  /*background-color: white;*/
  /*color: black;*/
  /*font-size: 1em;*/
  /*max-height: 100%;*/
  max-width: 400px;
}

.epub-container {
}
.epub-viewer {
  /*max-width: 60em;*/
  /*max-height:100%;*/

  width: 60em;
  margin: 0 auto;

}

.epub-viewer-xs {
  /*max-width: 40em;*/
  /*max-height:100%;*/
  width: 60em;
  margin: 0 auto;
}

</style>
