<template>
  <div>
    <div id="viewer" />
    <div
      id="pagination"
      v-if="bookSrc">
      <v-icon
        large
        @click="prev($event)"
      >
        keyboard_arrow_left
      </v-icon>
      <v-icon
        large
        @click="next($event)"
      >
        keyboard_arrow_right
      </v-icon>
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
          this.book = new Book(src, {})

          this.rendition = this.book.renderTo('viewer', {
            // width: 400,
            // height: 400
          })

          console.log('rendition:', this.rendition)

          this.displayed = this.rendition.display()
          console.log('displayed:', this.displayed) // this is a promise

          this.displayed.then(data => console.log('data:', data))
        }
      },
      next (event) {
        this.rendition.next()
        event.preventDefault()
      },
      prev (event) {
        this.rendition.prev()
        event.preventDefault()
      }
    }
  }
</script>

<style scoped>
#viewer {
  overflow: hidden;
  width: 800px;
  /*height: 400px;*/
  margin: 0 50px;
  /*background: url('ajax-loader.gif') center center no-repeat;*/
}
#viewer .epub-view {
  background: white;
  box-shadow: 0 0 4px #ccc;
  /*margin: 10px;*/
  /*padding: 40px 80px;*/
}
</style>
