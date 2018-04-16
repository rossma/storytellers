<template>
  <div>
    <v-tabs
      slot="extension"
      v-model="tab"
      icons-and-text
      centered
      dark
      color="cyan"
      grow
    >
      <v-tabs-slider color="yellow" />
      <v-tab>
        Writing
        <v-icon>mdi mdi-book-open-page-variant</v-icon>
      </v-tab>
      <v-tab>
        Picture
        <v-icon>mdi mdi-palette</v-icon>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <div id="viewer" />
            <div id="pagination">
              <a
                id="prev"
                href="#prev"
                class="arrow"
                @click="prev($event)">...</a>
              <a
                id="next"
                href="#next"
                class="arrow"
                @click="next($event)">...</a>
            </div>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <v-card-text class="text-xs-center">
            <img
              v-show="pageImageSrc()"
              :src="pageImageSrc()"
              class="card-img-top img-fluid thumb"
              title="Upload"
              @click.stop="openMediumDialog()">
            <img
              v-show="!pageImageSrc()"
              class="card-img-top img-fluid thumb"
              src="/img/missing-image.png"
              title="Upload"
              @click.stop="openMediumDialog()">
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
    <story-tabs-medium-viewer
      :story-oid="page.data.storyOid"
      :chapter-oid="page.data.chapterOid"
      :page-oid="page.id"
      :current-image-oid="currentImageOid"
      :editable="editable"
      :has-story-cover="hasStoryCover"
      :dialog="imageDialog"
      :src="pageImageSrc()"
      @close="imageDialog = false" />
  </div>
</template>

<script>
import StoryTabsMediumViewer from '~/components/StoryTabsMediumViewer'
// https://github.com/futurepress/epub.js/tree/v0.3/libs
import Epub from 'epubjs/lib/index'

// global.ePub = Epub
window.ePub = Epub

var url = 'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/pg19033.epub?alt=media&token=06a11974-4ef1-41bf-a11c-b4a573af8f30'
var book = window.ePub(url)
var rendition = book.renderTo('viewer', {
  width: 400,
  height: 400
})

var displayed = rendition.display()
console.log('displayed:', displayed)

export default {
  name: 'StoryTabs',
  components: {
    StoryTabsMediumViewer
  },
  props: {
    page: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    },
    hasStoryCover: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      tab: null,
      imageDialog: false
    }
  },
  computed: {
    currentImageOid: function () {
      return (this.page.data.image && this.page.data.image.filename)
    }
  },
  methods: {
    next (event) {
      console.log('ssssssssssssssssssssss next')
      rendition.next()
      event.preventDefault()
    },
    prev (event) {
      console.log('ssssssssssssssssssssss prev')
      rendition.prev()
      event.preventDefault()
    },
    pageImageSrc () {
      if (this.page.data.image && this.page.data.image.ref) {
        return this.page.data.image.ref
      } else {
        return ''
      }
    },
    openMediumDialog () {
      this.imageDialog = true
    }
  }
}
</script>

<style>
  img {
    max-width: 100%;
    height: auto;
  }

  img.thumb {
    max-height: 300px;
    cursor: pointer;
  }

  body {
    overflow: auto;
    background: #eee;
  }

  /*#wrapper {*/
    /*width: 480px;*/
    /*height: 640px;*/
    /*overflow: hidden;*/
    /*border: 1px solid #ccc;*/
    /*margin: 20px auto;*/
    /*background: #fff;*/
    /*border-radius: 0 5px 5px 0;*/
  /*}*/

  /*#area {*/
    /*width: 480px;*/
    /*height: 650px;*/
    /*margin: -5px auto;*/
    /*-moz-box-shadow:      inset 10px 0 20px rgba(0,0,0,.1);*/
    /*-webkit-box-shadow:   inset 10px 0 20px rgba(0,0,0,.1);*/
    /*box-shadow:           inset 10px 0 20px rgba(0,0,0,.1);*/
    /*padding: 40px 40px;*/
  /*}*/

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

  #pagination {
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
  #prev {
    float: left;
  }
  #next {
    float: right;
  }

</style>
