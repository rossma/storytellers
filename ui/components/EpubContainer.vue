<template>
  <div>
    <div v-if="bookSrc">
      <div id="navigation" class="ebook-navigation">
        <h1 id="title">...</h1>
        <image id="cover" width="150px"/>
        <h2 id="author">...</h2>
        <div id="toc" class="ebook-toc"></div>
      </div>
      <div id="main">
        <div id="viewer" class="ebook-viewer"/>
        <div
          id="pagination"
          class="ebook-pagination">
          <v-icon
            large
            class="ebook-prev"
            @click="prevPage($event)"
          >
            keyboard_arrow_left
          </v-icon>
          <v-icon
            large
            class="ebook-next"
            @click="nextPage($event)"
          >
            keyboard_arrow_right
          </v-icon>
        </div>
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
        }
      }
    },
    computed: {
    },
    mounted: function () {
      console.log('mounted')
      this.$nextTick(() => {
        this.createBook(this.bookSrc)

        EventBus.$on('epubBookSrc', src => {
          this.createBook(src)
        })

      })
    },
    beforeDestroy () {
      EventBus.$off('epubBookSrc')
    },
    methods: {
      createBook (src) {
        console.log('In epub create book')
        // console.log(src)

        if (src) {
          if (this.book) {
            this.book.destroy()
          }

          // global.ePub = Epub
          window.ePub = Epub

          // const url = 'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/pg19033.epub?alt=media&token=06a11974-4ef1-41bf-a11c-b4a573af8f30'
          // const book = window.ePub(src)
          this.book = new Book(src, {
            // fixedLayout: true,
            // layoutOveride : { layout: 'pre-paginated' }
          })
          // this.book = window.ePub(src, {})

          // this.book.forceSingle(true) method not a function

          this.rendition = this.book.renderTo('viewer', {
            flow: "scrolled-doc"
            // fixedLayout: true
             // width: 400,
             // height: 400
            // layoutOveride : { layout: 'pre-paginated' }
          })

          console.log('rendition:', this.rendition)

          // this.rendition.layout('pre-paginated')
          // this.rendition.layout('reflowable')



          this.book.on('renderer:resized', (data) => { // doesnt get called?
            console.log('resizing', data)
          })

          this.displayed = this.rendition.display()
          console.log('displayed:', this.displayed) // this is a promise

          this.displayed.then(data => console.log('displayed data:', data))

          this.rendition.on("rendered", (section) => {
            var nextSection = section.next()
            var prevSection = section.prev()
            if(nextSection) {
              this.nextNav = this.book.navigation.get(nextSection.href)
              if(this.nextNav) {
                this.nextLabel = nextNav.label
              } else {
                this.nextLabel = "next"
              }
              this.next.textContent = this.nextLabel + " »"
            } else {
              this.next.textContent = ""
            }
            if(prevSection) {
              this.prevNav = this.book.navigation.get(prevSection.href)
              if(this.prevNav) {
                this.prevLabel = prevNav.label
              } else {
                this.prevLabel = "previous"
              }
              this.prev.textContent = "« " + this.prevLabel
            } else {
              this.prev.textContent = ""
            }
            // Add CFI fragment to the history
            //history.pushState({}, '', section.href)
            window.location.hash = "#/"+section.href
          })

          this.rendition.on("relocated", (location) => {
            console.log(location)
          })

          this.book.loaded.navigation.then( (toc) => {
            var $nav = document.getElementById("toc"),
              docfrag = document.createDocumentFragment()
            var addTocItems = (parent, tocItems) => {
              var $ul = document.createElement("ul")
              tocItems.forEach( (chapter) => {
                var item = document.createElement("li")
                var link = document.createElement("a")
                link.textContent = chapter.label
                link.href = chapter.href
                item.appendChild(link)
                if (chapter.subitems) {
                  addTocItems(item, chapter.subitems)
                }
                link.onclick = () => {
                  var url = link.getAttribute("href")
                  this.rendition.display(url)
                  return false
                }
                $ul.appendChild(item)
              })
              parent.appendChild($ul)
            }
            addTocItems(docfrag, toc)
            $nav.appendChild(docfrag)
            if ($nav.offsetHeight + 60 < window.innerHeight) {
              $nav.classList.add("fixed")
            }
          })

          this.book.loaded.metadata.then( (meta) => {
            var $title = document.getElementById("title")
            var $author = document.getElementById("author")
            var $cover = document.getElementById("cover")
            $title.textContent = meta.title
            $author.textContent = meta.creator
            if (this.book.archive) {
              this.book.archive.createUrl(this.book.cover)
                .then( (url) => {
                  $cover.src = url
                })
            } else {
              $cover.src = this.book.cover
            }
          })

        }
      },
      nextPage (event) {
        this.rendition.next()
        event.preventDefault()
      },
      prevPage (event) {
        this.rendition.prev()
        event.preventDefault()
      }
    }
  }
</script>

<style scoped>
.epub-container {
  /*height:100px;*/
  /*width: 100px;*/
}

.ebook-navigation {
  width: 300px;
  position: absolute;
  overflow: auto;
  top: 60px;
  left: 1000px
}
.ebook-navigation.fixed {
  position: fixed;
}
.ebook-navigation h1 {
  width: 200px;
  font-size: 16px;
  font-weight: normal;
  color: #777;
  margin-bottom: 10px;
}
.ebook-navigation h2 {
  font-size: 14px;
  font-weight: normal;
  color: #B0B0B0;
  margin-bottom: 20px;
}
.ebook-navigation ul {
  padding-left: 18px;
  margin-left: 0;
  margin-top: 12px;
  margin-bottom: 12px;
}
.ebook-navigation ul li {
  list-style: decimal;
  margin-bottom: 10px;
  color: #cccddd;
  font-size: 12px;
  padding-left: 0;
  margin-left: 0;
}
.ebook-navigation ul li a {
  color: #ccc;
  text-decoration: none;
}
.ebook-navigation ul li a:hover {
  color: #777;
  text-decoration: underline;
}
.ebook-navigation ul li a.active {
  color: #000;
}

/*.ebook-viewer {*/
  /*!*overflow: hidden;*!*/
  /*!*width: 800px;*!*/
  /*!*height: 400px;*!*/
  /*!*margin: 0 50px;*!*/
  /*!*background: url('ajax-loader.gif') center center no-repeat;*!*/
  /*!*height:100vh;*!*/
/*}*/


/*.ebook-viewer .epub-view {*/
  /*background: white;*/
  /*box-shadow: 0 0 4px #ccc;*/
  /*!*margin: 10px;*!*/
  /*!*padding: 40px 80px;*!*/
/*}*/

.ebook-viewer {
  overflow: hidden;
  width: 800px;
  margin: 0 50px;
  /*background: url('ajax-loader.gif') center center no-repeat;*/
}
.ebook-viewer .epub-view {
  background: white;
  box-shadow: 0 0 4px #ccc;
  /*margin: 10px;*/
  /*padding: 40px 80px;*/
}
.ebook-main {
  position: absolute;
  top: 50px;
  left: 50px;
  width: 800px;
  z-index: 2;
  transition: left .15s cubic-bezier(.55, 0, .2, .8) .08s;
}
.ebook-main.open {
  left: 0;
}
.ebook-pagination {
  text-align: center;
  margin-left: 80px;
  /*padding: 0 50px;*/
}
.arrow {
  margin: 14px;
  display: inline-block;
  text-align: center;
  text-decoration: none;
  color: #ccc;
}
.arrow:hover {
  color: #777;
}
.arrow:active {
  color: #000;
}
.ebook-prev {
  float: left;
}
.ebook-next {
  float: right;
}
.ebook-toc {
  display: block;
  margin: 10px auto;
}

</style>
