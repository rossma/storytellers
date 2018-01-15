<template>
  <v-container grid-list-xl>
    <v-layout
      v-if="story.id"
      row
      wrap>
      <v-flex xs12>
        <v-expansion-panel>
          <v-expansion-panel-content>
            <div slot="header">
              <div><h2>{{ story.data.title }}</h2></div>
              <div v-show="authorUser.displayName"><h5>{{ authorUser.displayName }}</h5></div>
            </div>
            <story-detail
              name="StoryDetail"
              :story="story"
              :editable="isEditable"
              :story-exists="true"
              style="padding-bottom:10px;"/>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-flex>
      <v-flex xs12>
        <v-tabs
          dark
          grow
          icons>
          <v-toolbar
            color="cyan"
            dark>
            <v-tabs-bar
              class="cyan"
              slot="extension">
              <v-tabs-slider color="yellow" />
              <v-tabs-item href="#writing-tab">
                <v-icon>mdi mdi-book-open-page-variant</v-icon>
                Writing
              </v-tabs-item>
              <v-tabs-item href="#picture-tab">
                <v-icon>mdi mdi-palette</v-icon>
                Picture
              </v-tabs-item>
            </v-tabs-bar>
          </v-toolbar>
          <v-tabs-items>
            <v-tabs-content :id="'writing-tab'">
              <v-card flat>
                <v-card-text>
                  temp text
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'picture-tab'">
              <v-card flat>
                <v-card-text class="text-xs-center">
                  <img
                    v-show="pageImageSrc"
                    class="card-img-top img-fluid thumb"
                    :src="pageImageSrc"
                    @click.stop="openImageDialog()"
                    title="Upload">
                  <img
                    v-show="!pageImageSrc"
                    class="card-img-top img-fluid thumb"
                    src="/img/missing-image.png"
                    @click.stop="openImageDialog()"
                    title="Upload">
                </v-card-text>
              </v-card>
            </v-tabs-content>
          </v-tabs-items>
        </v-tabs>
        <v-btn
          v-if="canPublish()"
          dark
          fab
          fixed
          bottom
          right
          color="green"
          @click="publish"
        >
          <v-icon>mdi mdi-publish</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <image-viewer
      v-if="(story.id && chapter.id && page.id)"
      :story-oid="story.id"
      :chapter-oid="chapter.id"
      :page-oid="page.id"
      :current-image-oid="currentImageOid"
      :editable="isEditable"
      :has-story-cover="story.cover"
      :dialog="imageDialog"
      :src="pageImageSrc"
      @close="imageDialog = false" />
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import { findPageByOid, publishPage } from '~/service/page'
import { findUserByOid } from '~/service/user'
import { findStoryByOid } from '~/service/story'
import { findChapterByOid } from '~/service/chapter'
import { findImageByOid } from '~/service/image'
import StoryDetail from '~/components/story/StoryDetail.vue'
import stringUtils from '~/utils/string'
import ImageViewer from '~/components/story/ImageViewer'

export default {
  components: {
    StoryDetail,
    ImageViewer
  },
  layout: 'story',
  data () {
    return {
      authorUser: '',
      chapter: {
        id: null,
        data: {
          number: null
        }
      },
      page: {
        id: null,
        data: {
          number: null
        }
      },
      story: {
        id: null,
        data: {
          summary: null
        }
      },
      imageDialog: false
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    isEditable: function () {
      return this.page.data.uid === this.user.uid
    },
    pageImageSrc: function () {
      if (this.page.data.image && this.page.data.image.ref) {
        return this.page.data.image.ref
      } else {
        return ''
      }
    },
    currentImageOid: function () {
      return (this.page.data.image && this.page.data.image.filename)
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      console.log('[Story Detail] - in mounted, page id:', this.$route.params.id)
      this.loadPage(this.$route.params.id)

      EventBus.$on('storyImageFileKey', filenameKey => {
        console.log(`[Story Detail] - storyImageFileKey event received, filenameKey:${filenameKey}`)
        this.page.data.image = { filename: filenameKey }
      })
    })
  },
  beforeDestroy () {
    EventBus.$off('storyImageFileKey')
  },
  methods: {
    ...mapActions([
      'saveStory'
    ]),
    loadPage (pageOid) {
      findPageByOid(pageOid).then((pageDoc) => {
        if (pageDoc.exists) {
          this.page.id = pageOid
          this.page.data = pageDoc.data()
          if (this.isAuthorised()) {
            this.initAuthorUser(this.page.data.uid)
            this.initStory(this.page.data.storyOid)
            this.initChapter(this.page.data.chapterOid)
          } else {
            this.$toast.error('User not authorised to view this page')
          }
        } else {
          this.$toast.error('Page does not exist')
        }
      })
    },
    initAuthorUser (userOid) {
      findUserByOid(userOid).then((userDoc) => {
        if (userDoc.exists) {
          this.authorUser = userDoc.data()
        } else {
          this.$toast.error('Author does not exist')
        }
      })
    },
    initStory (storyOid) {
      findStoryByOid(storyOid).then((storyDoc) => {
        if (storyDoc.exists) {
          this.story.id = storyDoc.id
          this.story.data = storyDoc.data()
          this.saveStory(this.story)
          this.publishStoryEvent(this.story, this.page)
        } else {
          this.$toast.error('Story does not exist')
        }
      })
    },
    initChapter (chapterOid) {
      findChapterByOid(chapterOid).then((chapterDoc) => {
        if (chapterDoc.exists) {
          this.chapter.id = chapterDoc.id
          this.chapter.data = chapterDoc.data()
        } else {
          this.$toast.error('Chapter does not exist')
        }
      })
    },
    isAuthorised () {
      return this.page.data.public || this.page.data.uid === this.user.uid
    },
    canPublish () {
      return !this.page.data.public && this.page.data.uid === this.user.uid
    },
    publishStoryEvent (story, page) {
      console.log('publishing story event')
      story.activeChapterOid = page.data.chapterOid
      EventBus.$emit('storyEvent', story)
    },
    openImageDialog () {
      if (this.pageImageSrc) {
        this.imagePreviewSrc = this.pageImageSrc
      } else {
        this.imagePreviewSrc = ''
      }
      this.imageDialog = true
    },
    findImageFilenameKey () {
      if (this.page.data.image && this.page.data.image.filename) {
        const filenameKey = this.page.data.image.filename.split('.').shift()
        return findImageByOid(filenameKey)
      } else {
        return Promise.reject(new Error('Image reference can not be found'))
      }
    },
    publish () {
      console.log('publishing story')
      this.findImageFilenameKey().then((imageDoc) => {
        if (imageDoc.exists) {
          let preview = {
            storyOid: this.story.id,
            chapterOid: this.chapter.id,
            pageOid: this.page.id,
            title: this.story.data.title,
            summary: stringUtils.truncateWithEllipse(this.story.data.summary, 100),
            uid: this.user.uid,
            userDisplayName: this.user.data.displayName,
            previewImageUrl: imageDoc.data().previewUrl,
            imageFilenameOid: imageDoc.id
          }
          return publishPage(preview)
        } else {
          // possible if the server function hasn't run yet
          console.log('Image.vue Document not found in DB at this time')
          return Promise.reject(new Error('There was an error finding image reference'))
        }
      }).then(() => {
        this.page.data.public = true
        this.$toast.success('Story published')
      }).catch((error) => {
        console.log('There was an error publishing page', error)
        this.$toast.error(error.message)
      })
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
</style>
