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
                    v-show="pageImageSrc()"
                    class="card-img-top img-fluid thumb"
                    :src="pageImageSrc()"
                    @click.stop="openImageDialog()"
                    title="Upload">
                  <img
                    v-show="!pageImageSrc()"
                    class="card-img-top img-fluid thumb"
                    src="/img/missing-image.png"
                    @click.stop="openImageDialog()"
                    title="Upload">
                </v-card-text>
              </v-card>
            </v-tabs-content>
          </v-tabs-items>
        </v-tabs>
        <v-speed-dial
          v-model="action.fab"
          :direction="action.direction"
          :hover="action.hover"
          :transition="action.transition"
          bottom
          fixed
          right>
          <v-btn
            v-if="canPublish() || isEditable"
            slot="activator"
            color="blue darken-2"
            dark
            fab
            hover
            v-model="action.fab"
          >
            <v-icon>mdi mdi-radiobox-marked</v-icon>
            <v-icon>mdi mdi-radiobox-blank</v-icon>
          </v-btn>
          <v-tooltip left>
            <v-btn
              v-if="canPublish()"
              fab
              dark
              small
              color="green"
              @click="publish"
              slot="activator"
            >
              <v-icon>mdi mdi-publish</v-icon>
            </v-btn>
            <span>Publish Page</span>
          </v-tooltip>
          <v-tooltip left>
            <v-btn
              v-if="canDeletePage()"
              fab
              dark
              small
              color="red"
              @click.stop="deletePageDialog = true"
              slot="activator"
            >
              <v-icon>mdi mdi-delete</v-icon>
            </v-btn>
            <span>Delete Page</span>
          </v-tooltip>
        </v-speed-dial>
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
      :src="pageImageSrc()"
      @close="imageDialog = false" />
    <v-dialog
      v-model="deletePageDialog"
      persistent
      max-width="290">
      <v-card>
        <v-card-title class="headline">Delete Page?</v-card-title>
        <v-card-text>Are you sure you want to delete this page?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            @click="deleteCurrentPage">Yes</v-btn>
          <v-btn
            color="darken-1"
            @click.native="deletePageDialog = false">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import { findPageByOid, publishPage, deletePage } from '~/service/page'
import { findUserByOid } from '~/service/user'
import { findStoryByOid } from '~/service/story'
import { deleteChapter, findChapterByOid } from '~/service/chapter'
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
      action: {
        fab: false,
        direction: 'top',
        hover: false,
        transition: 'slide-y-reverse-transition'
      },
      authorUser: '',
      chapter: {
        id: null,
        data: {
          number: null
        }
      },
      deletePageDialog: false,
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
      'user', 'pages'
    ]),
    isEditable: function () {
      return this.page.data.uid === this.user.uid
    },
    currentImageOid: function () {
      return (this.page.data.image && this.page.data.image.filename)
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      console.log('[Story Detail] - in mounted, page id:', this.$route.params.id)
      this.loadPage(this.$route.params.id)

      EventBus.$on('storyImageFileKey', imageDetails => {
        console.log(`[Story Detail] - storyImageFileKey event received:`, imageDetails)
        this.page.data.image = {
          filename: imageDetails.filenameKey,
          ref: imageDetails.imageSrc
        }
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
    canDeletePage () {
      return this.isEditable && this.pages && this.pages.length > 1
    },
    pageImageSrc () {
      if (this.page.data.image && this.page.data.image.ref) {
        return this.page.data.image.ref
      } else {
        return ''
      }
    },
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
          this.story.activeChapterOid = this.page.data.chapterOid
          this.saveStory(this.story)
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
    openImageDialog () {
      if (this.pageImageSrc()) {
        this.imagePreviewSrc = this.pageImageSrc()
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
          console.log('Image Document not found in DB at this time')
          return Promise.reject(new Error('There was an error finding image reference'))
        }
      }).then(() => {
        this.page.data.public = true
        this.$toast.success('Story published')
      }).catch((error) => {
        console.log('There was an error publishing page', error)
        this.$toast.error(error.message)
      })
    },
    deleteCurrentPage () {
      this.deletePageDialog = false

      if (this.pages) {
        const runDelete = () => {
          if (this.chapterPageCount(this.pages, this.page.data.chapterOid) >= 1) {
            return deleteChapter(this.page.data.chapterOid)
          } else {
            return deletePage(this.page.id)
          }
        }

        runDelete().then(() => {
          // TODO work out the next story to show
          this.$router.push(`/story/detail/${this.pages.pop().id}`)
        }).catch((error) => {
          console.log('There was an error deleting the current page', error)
          this.$toast.error(error.message)
        })
      } else {
        console.log('Error, expected pages collection to be set in store but it is not defined')
        this.$toast.error('Oops! There is a bug!')
      }
    },
    chapterPageCount (pages, chapterOid) {
      return pages.filter((page) => page.data.chapterOid === chapterOid).length
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
