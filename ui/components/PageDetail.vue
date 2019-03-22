<template>
  <div>
    <v-card flat>
      <!--<v-card-text class="text-xs-center">-->
      <v-img
        v-show="pageImageSrc()"
        :src="pageImageSrc()"
        title="Upload"
        @click.stop="openMediumDialog()"
      />
      <v-img
        v-show="!pageImageSrc()"
        src="/img/missing-image.png"
        title="Upload"
        @click.stop="openMediumDialog()"
      />
      <!--<img-->
      <!--v-show="pageImageSrc()"-->
      <!--:src="pageImageSrc()"-->
      <!--class="card-img-top img-fluid thumb"-->
      <!--title="Upload"-->
      <!--@click.stop="openMediumDialog()">-->
      <!--<img-->
      <!--v-show="!pageImageSrc()"-->
      <!--class="card-img-top img-fluid thumb"-->
      <!--src="/img/missing-image.png"-->
      <!--title="Upload"-->
      <!--@click.stop="openMediumDialog()">-->
      <v-card-actions
        v-if="page.public"
        class="black"
      >
        <v-spacer />
        {{ likes }} likes
        <v-btn
          icon
          @click="like()"
        >
          <v-icon :color="liked ? 'red' : 'white' ">
            favorite
          </v-icon>
        </v-btn>
        {{ comments }} comments
        <v-btn
          icon
          @click="commentsDialog = true"
        >
          <v-icon>comments</v-icon>
        </v-btn>
      </v-card-actions>
      <!--</v-card-text>-->
    </v-card>
    <medium-viewer
      :story-oid="page.storyOid"
      :chapter-oid="page.chapterOid"
      :page-oid="page.id"
      :current-image-oid="currentImageOid"
      :editable="editable"
      :story-cover="storyCover"
      :dialog="imageDialog"
      :image-filename="pageImageFilename()"
      :image-src="pageImageSrc()"
      :book-src="pageBookSrc()"
      :book-type="pageBookType()"
      :rich-text-src="pageRichTextSrc()"
      @close="imageDialog = false"
    />
    <page-comments
      :comments="page.comments"
      :dialog="commentsDialog"
      :page-id="page.id"
      :uid="user.uid"
      :user-display-name="user.data.displayName ? user.data.displayName : 'Anon'"
      @increment="newComment"
      @close="commentsDialog = false"
    />
  </div>
</template>

<script>
import MediumViewer from '~/components/MediumViewer'
import PageComments from '~/components/PageComments'
import { updatePage } from '~/api/service/page'
import debug from 'debug'
const log = debug('app:components/PageDetail')

export default {
  name: 'PageDetail',
  components: {
    MediumViewer,
    PageComments
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
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      commentsDialog: false,
      imageDialog: false
    }
  },
  computed: {
    currentImageOid: function() {
      return this.page.image && this.page.image.filename
    },
    liked: {
      get() {
        log('in liked get', this.page.likes)
        if (this.page.likes) {
          return this.page.likes.includes(this.user.uid)
        } else {
          return false
        }
      },
      set(val) {
        log('in liked set')
        if (!this.page.likes) {
          this.page.likes = []
        }

        if (val) {
          if (!this.page.likes.includes(this.user.uid)) {
            this.page.likes.push(this.user.uid)
          }
        } else {
          this.page.likes = this.page.likes.filter(el => el !== this.user.uid)
        }
      }
    },
    comments: function() {
      if (this.page.comments) {
        return this.page.comments.length
      } else {
        return 0
      }
    },
    likes: function() {
      if (this.page.likes) {
        return this.page.likes.length
      } else {
        return 0
      }
    }
  },
  methods: {
    like() {
      log('in like', this.liked)
      this.liked = !this.liked
      log('updating page', this.page.id, this.page.likes)
      updatePage(this.page.id, { likes: this.page.likes })
    },
    newComment(comment) {
      if (this.page.comments) {
        this.page.comments.push(comment)
      } else {
        this.page.comments = [comment]
      }
    },
    pageImageFilename() {
      if (this.page.image && this.page.image.filename) {
        return this.page.image.filename
      } else {
        return ''
      }
    },
    pageImageSrc() {
      if (this.page.image && this.page.image.ref) {
        return this.page.image.ref
      } else {
        return ''
      }
    },
    pageBookSrc() {
      log('in pageBookSrc')
      if (this.page.book && this.page.book.ref) {
        return this.page.book.ref
      } else {
        return ''
      }
    },
    pageBookType() {
      log('in pageBookType book', this.page.book)
      if (this.page.book && this.page.book.contentType) {
        return this.page.book.contentType
      } else {
        return ''
      }
    },
    pageRichTextSrc() {
      log('in pageRichTextSrc')
      if (this.page.richText && this.page.richText.ref) {
        return this.page.richText.ref
      } else {
        return ''
      }
    },
    openMediumDialog() {
      this.imageDialog = true
    }
  }
}
</script>

<style>
.v-image {
  cursor: pointer;
  max-height: 500px;
}

body {
  overflow: auto;
  background: #eee;
}
</style>
