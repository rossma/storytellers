<template>
  <div>
    <v-card flat>
      <!--<v-card-text class="text-xs-center">-->
      <v-img
        v-show="pageImageSrc()"
        :src="pageImageSrc()"
        title="Upload"
        @click.stop="openPageMediumDialog()"
      />
      <v-img
        v-show="!pageImageSrc()"
        src="/img/missing-image.png"
        title="Upload"
        @click.stop="openPageMediumDialog()"
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
    <page-contribution-list
      v-if="page.invite"
      :page-oid="page.id"
      :user="user"
    />
    <page-medium-viewer
      :dialog="pageMediumDialog"
      :page="page"
      :story-cover="storyCover"
      :user="user"
      @close="pageMediumDialog = false"
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

import PageMediumViewer from '~/components/PageMediumViewer'
import PageComments from '~/components/PageComments'
import { updatePage } from '~/api/service/page'
import debug from 'debug'
import PageContributionList from './PageContributionList'
const log = debug('app:components/PageDetail')

export default {
  name: 'PageDetail',
  components: {
    PageContributionList,
    PageMediumViewer,
    PageComments
  },
  props: {
    page: {
      type: Object,
      required: true
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
      pageMediumDialog: false,
      isCollaboration: false,
      selectedPageCollaboration: {
        image: null
      }
    }
  },
  computed: {
    // currentImageOid: function() {
    //   return this.page.image && this.page.image.filename
    // },
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
    pageImageSrc() {
      if (this.page.image && this.page.image.ref) {
        return this.page.image.ref
      }
      return ''
    },
    openPageMediumDialog() {
      this.pageMediumDialog = true
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
