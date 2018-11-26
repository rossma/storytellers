<template>
  <div>
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
    <medium-viewer
      :story-oid="page.storyOid"
      :chapter-oid="page.chapterOid"
      :page-oid="page.id"
      :current-image-oid="currentImageOid"
      :current-book-oid="currentBookOid"
      :editable="editable"
      :story-cover="storyCover"
      :dialog="imageDialog"
      :image-filename="pageImageFilename()"
      :image-src="pageImageSrc()"
      :book-src="pageBookSrc()"
      @close="imageDialog = false" />
  </div>
</template>

<script>
import MediumViewer from '~/components/MediumViewer'

export default {
  name: 'PageDetail',
  components: {
    MediumViewer
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
    storyCover: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      imageDialog: false
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
    pageImageFilename () {
      if (this.page.image && this.page.image.filename) {
        return this.page.image.filename
      } else {
        return ''
      }
    },
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
</style>
