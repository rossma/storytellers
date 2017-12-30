<template>
  <v-container grid-list-xl>
    <v-alert
      outline
      :color="alert.colour"
      :icon="alert.icon"
      v-model="alert.show"
      dismissible>
      {{ alert.message }}
    </v-alert>
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
    <v-layout
      row
      justify-center>
      <v-dialog
        v-model="imageDialog"
        fullscreen
        transition="dialog-bottom-transition"
        :overlay="false">
        <v-card>
          <v-toolbar
            dark
            color="primary">
            <v-btn
              icon
              @click.native="imageDialog = false"
              dark>
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Story Image</v-toolbar-title>
            <v-spacer />
            <v-toolbar-items>
              <upload-button
                v-if="isEditable"
                name="Upload"
                icon="mdi mdi-palette"
                :selected-callback="previewImageFile" />
              <v-btn
                dark
                flat
                @click="saveImage">
                <v-icon left>mdi mdi-content-save</v-icon>
                Save
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-card-text class="text-xs-center">
            <img
              v-show="previewImageSrc"
              class="card-img-top"
              :src="previewImageSrc">
            <img
              v-show="!previewImageSrc"
              class="card-img-top"
              src="/img/missing-image.png">
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import { findPageByOid, updatePage } from '~/service/page'
import { findUserByOid } from '~/service/user'
import { findStoryByOid, updateStory } from '~/service/story'
import { addPreview } from '~/service/preview'
import { findChapterByOid } from '~/service/chapter'
import { deleteImage, findImageByOid, uploadStoryImage } from '~/service/image'
import alertUtil from '~/utils/alert'
import StoryDetail from '~/components/story/StoryDetail.vue'
import stringUtils from '~/utils/string'
import UploadButton from '~/components/UploadButton'

export default {
  components: {
    StoryDetail,
    UploadButton
  },
  layout: 'story',
  data () {
    return {
      alert: {
        show: false
      },
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
      imageFile: null,
      imageFilenameKey: null,
      imageFileExt: null,
      imagePreviewSrc: '',
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
    previewImageSrc: function () {
      if (this.imagePreviewSrc) {
        return this.imagePreviewSrc
      } else {
        return ''
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      console.log('[Story Detail] - in mounted, page id:', this.$route.params.id)
      this.loadPage(this.$route.params.id)
      EventBus.$on('alert', alert => {
        this.alert = alert
      })
    })
  },
  beforeDestroy () {
    EventBus.$off('alert')
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
            this.alert = alertUtil.raiseAlert('error', 'User not authorised to view this page')
          }
        } else {
          this.alert = alertUtil.raiseAlert('error', 'Page does not exist')
        }
      })
    },
    initAuthorUser (userOid) {
      findUserByOid(userOid).then((userDoc) => {
        if (userDoc.exists) {
          this.authorUser = userDoc.data()
        } else {
          this.alert = alertUtil.raiseAlert('error', 'Author does not exist')
        }
      })
    },
    initStory (storyOid) {
      findStoryByOid(storyOid).then((storyDoc) => {
        if (storyDoc.exists) {
          this.story.id = storyDoc.id
          this.story.data = storyDoc.data()
          this.saveStory(this.story)
          this.publishStoryEvent(this.story)
        } else {
          this.alert = alertUtil.raiseAlert('error', 'Story does not exist')
        }
      })
    },
    initChapter (chapterOid) {
      findChapterByOid(chapterOid).then((chapterDoc) => {
        if (chapterDoc.exists) {
          this.chapter.id = chapterDoc.id
          this.chapter.data = chapterDoc.data()
          console.log('chapter.....', this.chapter)
        } else {
          this.alert = alertUtil.raiseAlert('error', 'Chapter does not exist')
        }
      })
    },
    isAuthorised () {
      return this.page.data.public || this.page.data.uid === this.user.uid
    },
    canPublish () {
      return !this.page.data.public && this.page.data.uid === this.user.uid
    },
    publishStoryEvent (story) {
      console.log('publishing story event')
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
    previewImageFile (file) {
      console.log('in previewImageFile')
      this.imageFile = file
      let reader = new FileReader()
      reader.onloadend = () => {
        this.imagePreviewSrc = reader.result
      }

      if (file) {
        reader.readAsDataURL(file)
      }
    },
    saveImage () {
      console.log('saving image')
      if (this.imageFile) {
        var metadata = {
          'contentType': this.imageFile.type
        }
        this.imageFilenameKey = this.uuidv4()
        this.imageFileExt = this.imageFile.name.split('.').pop()
        if (this.page.data.image && this.page.data.image.filename) {
          console.log('Deleting reference to old image')
          deleteImage(this.page.data.image.filename.split('.').shift()).then(() => {
            console.log(`Old image with name:${this.page.data.image.filename} deleted`)
          })
        }
        console.log('uploading image')
        uploadStoryImage(this.imageFile, metadata, this.imageFilenameKey, this.imageFileExt).then((downloadUrl) => {
          this.saveImageReference(downloadUrl)
        }).catch((error) => {
          this.alert = alertUtil.raiseAlert('error', error.message)
        })
        this.imageDialog = false
      } else {
        console.log('Image file not set')
        // todo raise error alert
      }
    },
    saveImageReference (imageUrl) {
      console.log('ImageURL:', imageUrl)
      this.imageFileUrl = imageUrl

      this.page.data = {
        image: {
          filename: `${this.imageFilenameKey}.${this.imageFileExt}`,
          ref: imageUrl,
          created: Date.now()
        }
      }

      updatePage(this.page.id, this.page.data).then(() => {
        if (!this.story.cover) {
          // if no cover exist then set this image to the cover
          return updateStory(this.story.id, {
            cover: {
              chapterOid: this.chapter.id,
              pageOid: this.page.id,
              imageFilename: `${this.imageFilenameKey}.${this.imageFileExt}`,
              imageRef: this.imageFileUrl
            }
          })
        } else {
          return Promise.resolve()
        }
      }).then(() => {
        console.log('Page here looks like:', this.page)
        this.alert = alertUtil.raiseAlert('success', 'Image updated')
      }).catch((error) => {
        console.error('Error updating page document:', error)
        this.alert = alertUtil.raiseAlert('error', 'Error updating page')
      })
    },
    publish () {
      console.log('publishing story')
      let page = {public: true}
      updatePage(this.page.id, page).then(() => {
        console.log('imageFilenameKey:', this.imageFilenameKey)
        return findImageByOid(this.imageFilenameKey)
      }).then((imageDoc) => {
        let previewUrl = ''
        if (imageDoc.exists) {
          console.log('imageDoc:', imageDoc.data())
          previewUrl = imageDoc.data().previewUrl
        } else {
          // possible if the server function hasn't run yet
          console.log('Image.vue Document not found in DB at this time')
        }
        return addPreview({
          storyOid: this.story.id,
          chapterOid: this.chapter.id,
          pageOid: this.page.id,
          title: this.story.title,
          summary: stringUtils.truncateWithEllipse(this.story.summary, 100),
          uid: this.user.uid,
          userDisplayName: this.user.data.displayName,
          previewImageUrl: previewUrl,
          imageFilenameOid: this.imageFilenameKey
        })
      }).then(() => {
        this.alert = alertUtil.raiseAlert('success', 'Story published')
      }).catch((error) => {
        this.alert = alertUtil.raiseAlert('error', error.message)
      })
    },
    uuidv4 () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0
        var v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
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
