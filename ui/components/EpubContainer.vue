<template>
  <v-layout class="epub-wrapper">
    <v-card>
      <v-responsive :aspect-ratio="16/9">
        <v-card-text>
          <div class="viewer-container">
            <div
              id="viewer"
              :class="[spreadLayout ? '' : 'single', 'ebook-viewer-spreads']"
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
          </div>
        </v-card-text>
      </v-responsive>
    </v-card>
  </v-layout>
</template>

<script>
// https://github.com/futurepress/epub.js/tree/v0.3/libs
import Epub from 'epubjs/lib/index'
import { EventBus } from '~/utils/event-bus.js'
import debug from 'debug'

const log = debug('app:components/EpubContainer')

export default {
  name: 'EpubContainer',
  props: {
    bookSrc: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      book: null,
      mutableBookSrc: null,
      displayed: null,
      rendition: null,
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
      spreadLayout: true
    }
  },
  computed: {
    // hasBookUrl: function() {
    //   log('this.bookSrc', this.mutableBookSrc)
    //   if (this.mutableBookSrc) {
    //     return true
    //   } else {
    //     return false
    //   }
    // }
  },
  beforeCreate: function() {
    log('in before create')
  },
  created: function() {
    log('in created')
  },
  mounted: function() {
    log('EPUB ............. mounted')
    this.createBook(this.bookSrc2)

    this.$nextTick(() => {
      EventBus.$on('init-ebook', () => {
        this.init()
      })

      EventBus.$on('epub-book-src', src => {
        this.createBook(src)
      })
    })
  },
  beforeDestroy() {
    EventBus.$off('init-ebook')
    EventBus.$off('epub-book-src')
  },
  methods: {
    init() {
      log('IN EPUB INIT')
      if (!this.book && this.bookSrc) {
        this.createBook(this.bookSrc)
      }
    },
    createBook(src) {
      log('In epub create book', src)

      if (src) {
        this.mutableBookSrc = src

        if (this.book) {
          this.book.destroy()
        }

        window.ePub = Epub

        this.book = window.ePub(src, {})

        this.rendition = this.book.renderTo('viewer', {
          width: '100%',
          height: 600,
          spread: 'always'
        })

        const display = this.rendition.display()
        log('my display:', display)

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
          log('relocated: ', location)
          this.hasNext = !location.atEnd
          this.hasPrev = !location.atStart
        })

        // this.rendition.on("layout", (layout) => {
        //   log('rendition on layout', layout)
        // })

        window.addEventListener('unload', () => {
          log('unloading')
          this.book.destroy()
        })
      }
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
  }
}
</script>

<style scoped>
body {
  margin: 0;
  background: #fafafa;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;

  position: absolute;
  height: 100%;
  width: 100%;
  min-height: 800px;
}

.epub-wrapper > div {
  width: 100%;
}

.ebook-viewer-spreads {
  width: 900px;
  max-width: 100%;
  height: 600px;
  box-shadow: 0 0 4px #ccc;
  border-radius: 5px;
  padding: 0;
  position: relative;
  margin: 10px auto;
  /*background: white url('/img/ajax-loader.gif') center center no-repeat;*/
  background: white center center no-repeat;
  top: calc(50vh - 400px);
}

.ebook-viewer-spreads .epub-view > iframe {
  background: white;
}

.ebook-viewer.scrolled {
  overflow: hidden;
  width: 800px;
  margin: 0 auto;
  position: relative;
  background: url('/img/ajax-loader.gif') center center no-repeat;
}

.ebook-viewer.scrolled .epub-container {
  background: white;
  box-shadow: 0 0 4px #ccc;
  margin: 10px;
  padding: 20px;
}

.ebook-viewer.scrolled .epub-view > iframe {
  background: white;
}

.prev {
  left: 0;
}

.next {
  right: 0;
}

@media (min-width: 1000px) {
  .ebook-viewer-spreads:after {
    position: absolute;
    width: 1px;
    border-right: 1px #000 solid;
    height: 90%;
    z-index: 1;
    left: 50%;
    margin-left: -1px;
    top: 5%;
    opacity: 0.15;
    box-shadow: -2px 0 15px rgba(0, 0, 0, 1);
    content: '';
  }

  .ebook-viewer-spreads.single:after {
    display: none;
  }

  .prev {
    left: 40px;
  }

  .next {
    right: 40px;
  }
}

.arrow {
  position: fixed;
  top: 50%;
  margin-top: -32px;
  font-size: 64px;
  color: #e2e2e2;
  font-family: arial, sans-serif;
  font-weight: bold;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  text-decoration: none;
}

.arrow:hover,
.navlink:hover {
  color: #777;
}

.arrow:active,
.navlink:hover {
  color: #000;
}

svg {
  display: block;
}

.viewer-container {
  max-width: 100%;
}
</style>
