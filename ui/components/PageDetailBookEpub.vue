<template>
  <div>
    <v-card
      flat
    >
      <v-responsive :aspect-ratio="16/9">
        <v-layout
          justify-center
          class="epub-thumbnail-container"
        >
          <div
            id="epub-thumbnail-viewer"
            ref="epub-thumbnail-viewer"
            class="single epub-thumbnail-document"
          />
        </v-layout>
      </v-responsive>
    </v-card>

    <v-dialog
      v-model="dialog"
      eager
      fullscreen
    >
      <!--      <v-responsive :aspect-ratio="16/9">-->
      <v-card flat>
        <v-layout
          justify-center
          class="epub-container"
          tabindex="-1"
        >
          <div
            id="epub-viewer"
            ref="epub-viewer"
            class="scrolled epub-viewer"
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
const log = debug('app:components/PageDetailBookEpub')

export default {
  name: 'PageDetailBookEpub',
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
      dialog: false,
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
  computed: {},
  watch: {},
  mounted: function() {
    this.$nextTick(() => {
      this.init()
    })
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
        this.dialog = true
      })
    },
    initDialogRendition() {
      // todo dont need to destroy book..component destroys it .. or move to destroy metbod
      // this.destroyBook()

      this.rendition = new Rendition(this.book, {
        // flow: 'paginated',
        flow: 'scrolled-doc',
        method: 'continuous',
        // method: 'scrolled',
        width: '90%',
        // height: '100%'
      })
      log('book', this.book)

      const viewerEl = this.$refs['epub-viewer']
      this.rendition.attachTo(viewerEl)

      // this.rendition.display()
      const hash = window.location.hash.slice(2)
      log('hash:', hash)
      this.rendition.display(hash || undefined)

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
      //   log('In Layout')
      //   log(layout.spread)
      // })

      // this.rendition.on('resize', function(width, height) {
      //   log('In resize')
      //   log('Resized to:', width, height)
      // })
      // }
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
    }

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

.epub-thumbnail-document {
  /*background-color: white;*/
  /*color: black;*/
  /*font-size: 1em;*/
  /*max-height: 100%;*/
  max-width: 600px;
}

.epub-container {
}

.epub-viewer {
  max-width: 60em;
  /*max-height:100%;*/
}

</style>
