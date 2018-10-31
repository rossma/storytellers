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
        <v-icon>book</v-icon>
      </v-tab>
      <v-tab>
        Picture
        <v-icon>brush</v-icon>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card flat>
          <v-card-text>
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
      :story-oid="page.storyOid"
      :chapter-oid="page.chapterOid"
      :page-oid="page.id"
      :current-image-oid="currentImageOid"
      :current-book-oid="currentBookOid"
      :editable="editable"
      :has-story-cover="hasStoryCover"
      :dialog="imageDialog"
      :image-src="pageImageSrc()"
      :book-src="pageBookSrc()"
      @close="imageDialog = false" />
  </div>
</template>

<script>
import StoryTabsMediumViewer from '~/components/StoryTabsMediumViewer'

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
      imageDialog: true
    }
  },
  computed: {
    currentImageOid: function () {
      return (this.page.image && this.page.image.filename)
    },
    currentBookOid: function () {
      return (this.page.book && this.page.book.filename)
    }
  },
  methods: {
    pageImageSrc () {
      if (this.page.image && this.page.image.ref) {
        return this.page.image.ref
      } else {
        return ''
      }
    },
    pageBookSrc () {
      if (this.page.book && this.page.book.ref) {
        return this.page.book.ref
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
