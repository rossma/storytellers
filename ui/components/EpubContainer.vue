<template>
  <div>
    <div v-if="hasBookUrl">
      <div id="main">
        <div id="viewer"
             :class="[spreadLayout ? '' : 'single', 'ebook-viewer-spreads']" />
        <a id="prev" href="#prev" class="arrow prev" @click.prevent="prevPage()" v-show="hasPrev">‹</a>
        <a id="next" href="#next" class="arrow next" @click.prevent="nextPage()" v-show="hasNext">›</a>
      </div>
    </div>
    <img
      v-else
      class="card-img-top"
      src="/img/missing-image.png">
  </div>
</template>

<script>
  // https://github.com/futurepress/epub.js/tree/v0.3/libs
  import Epub from 'epubjs/lib/index'
  import Book from 'epubjs/lib/index'
  import { EventBus } from '~/utils/event-bus.js'

  export default {
    name: 'EpubContainer',
    props: {
      bookSrc: {
        type: String,
        required: true
      }
    },
    data () {
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
      hasBookUrl: function () {
        console.log('this.bookSrc', this.mutableBookSrc)
        if (this.mutableBookSrc) {
          return true
        } else {
          return false
        }
      }
    },
    created: () => {

    },
    mounted: function () {
      console.log('mounted')
      this.$nextTick(() => {
        EventBus.$on('initEbook', () => {
          this.init()
        })

        EventBus.$on('epubBookSrc', src => {
          this.createBook(src)
        })
      })
    },
    beforeDestroy () {
      EventBus.$off('initEbook')
      EventBus.$off('epubBookSrc')
    },
    methods: {
      init () {
        if (!this.book && this.bookSrc) {
          this.createBook(this.bookSrc)
        }
      },
      createBook (src) {
        console.log('In epub create book')
        // console.log(src)

        if (src) {
          // this.bookSrc = src
          this.mutableBookSrc = src

          console.log('a')
          if (this.book) {
            console.log('b')
            this.book.destroy()
          }

          // global.ePub = Epub
          window.ePub = Epub

          // const url = 'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/pg19033.epub?alt=media&token=06a11974-4ef1-41bf-a11c-b4a573af8f30'
          console.log('c')

          this.book = window.ePub(src, {})
          // this.book = window.ePub(url)

          this.rendition = this.book.renderTo('viewer', {
            width: "100%",
            height: 600,
            spread: "always"
          })

          console.log('d. rendition:', this.rendition)

          // this.rendition.display(currentSectionIndex)
          const display = this.rendition.display()
          console.log('display:', display)

          this.book.ready.then(() => {
            console.log('e. book is ready................')

            var keyListener = (e) => {

              if ((e.keyCode || e.which) == 37) {
                this.prevPage()
              }

              if ((e.keyCode || e.which) == 39) {
                this.nextPage()
              }

            }

            this.rendition.on("keyup", keyListener)
            document.addEventListener("keyup", keyListener, false)

          })

          // this.rendition.on("rendered", (section) => {
          // })

          this.rendition.on("relocated", (location) => {
            console.log('relocated: ', location)

            this.hasNext = !location.atEnd
            this.hasPrev = !location.atStart

          })

          // this.rendition.on("layout", (layout) => {
          //   console.log('rendition on layout', layout)
          // })

          window.addEventListener("unload", () => {
            console.log("unloading")
            this.book.destroy()
          })
        }
      },
      nextPage () {
        this.book.package.metadata.direction === "rtl" ? this.rendition.prev() : this.rendition.next()
      },
      prevPage () {
        this.book.package.metadata.direction === "rtl" ? this.rendition.next() : this.rendition.prev()
      }
    }
  }
</script>

<style scoped>
.epub-container {
  /*height:100px;*/
  /*width: 100px;*/
}

body {
  margin: 0;
  background: #fafafa;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #333;

  position: absolute;
  height: 100%;
  width: 100%;
  min-height: 800px;
}

.ebook-viewer-spreads {
  width: 900px;
  height: 600px;
  box-shadow: 0 0 4px #ccc;
  border-radius: 5px;
  padding: 0;
  position: relative;
  margin: 10px auto;
  background: white url('/img/ajax-loader.gif') center center no-repeat;
  /*background: white center center no-repeat;*/
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
    opacity: .15;
    box-shadow: -2px 0 15px rgba(0, 0, 0, 1);
    content:  "";
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
  color: #E2E2E2;
  font-family: arial, sans-serif;
  font-weight: bold;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  text-decoration: none;
}

.arrow:hover, .navlink:hover {
  color: #777;
}

.arrow:active, .navlink:hover {
  color: #000;
}

svg {
  display: block;
}

</style>
