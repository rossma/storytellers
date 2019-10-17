<template>
  <v-layout
    justify-center
  >
    <v-dialog
      v-model="dialog"
      persistent
      width="600px"
    >
      <v-card>
        <v-toolbar
          :color="theme"
        >
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            @click="closeDialog()"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-container grid-list-md>
            <v-row
              justify="end"
              class="mt-4 mb-6"
              no-gutters
            >
              <v-col>
                <input
                  v-show="false"
                  ref="imageUploader"
                  type="file"
                  accept="image/*"
                  @change="previewImageSelected"
                >
                <v-carousel
                  v-model="previewImageCarousel"
                  hide-delimiters
                  height="200"
                >
                  <v-carousel-item
                    v-if="pageImageSrc"
                  >
                    <v-row
                      class="fill-height"
                      align="center"
                      justify="center"
                    >
                      <v-img
                        :src="pageImageSrc"
                        aspect-ratio="0.5"
                        max-width="200"
                        max-height="200"
                      />
                    </v-row>
                  </v-carousel-item>
                  <v-carousel-item class="preview-image-item">
                    <v-row
                      class="fill-height"
                      align="center"
                      justify="center"
                    >
                      <v-img
                        :src="previewImageSrc"
                        aspect-ratio="0.5"
                        max-width="200"
                        max-height="200"
                        @click="openFileUpload"
                      />
                    </v-row>
                  </v-carousel-item>
                  <v-carousel-item
                    v-for="previewImage in previewImages"
                    :key="previewImage"
                  >
                    <v-row
                      class="fill-height"
                      align="center"
                      justify="center"
                    >
                      <v-img
                        :src="previewImage"
                        aspect-ratio="0.5"
                        max-width="200"
                        max-height="200"
                      />
                    </v-row>
                  </v-carousel-item>
                </v-carousel>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-textarea
                  v-model="summary"
                  auto-grow
                  filled
                  color="primary"
                  label="Summary"
                  maxlength="500"
                  rows="5"
                  row-height="24"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-flex v-if="!isPublished">
                  <v-tooltip top>
                    <template #activator="{ on }">
                      <v-switch
                        v-model="inviteSwitch"
                        label="Invite"
                        color="secondary"
                        v-on="on"
                      />
                    </template>
                    <span>Invite others to collaborate</span>
                  </v-tooltip>
                </v-flex>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="isPublished"
            color="secondary"
            @click="publishAndInvite()"
          >
            Invite
          </v-btn>
          <v-btn
            v-if="!isPublished"
            color="primary"
            @click="publish()"
          >
            Publish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import debug from 'debug'
import stringUtils from '~/utils/string'

import { mapGetters } from 'vuex'
import {
  publishPage,
  DEFAULT_WALLPAPERS
} from '~/api/service/page'
import { findImageByOid, uploadImage } from '~/api/service/image'

const log = debug('app:components/PagePublish')

export default {
  name: 'PagePublish',
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    page: {
      type: Object,
      required: true
    },
    uid: {
      type: String,
      required: true
    },
    userDisplayName: {
      type: String,
      required: true
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      summary: '',
      summaryDialog: false,
      isInvite: false,
      inviteSwitch: false,
      pageImageSrc: null,
      model: null,
      showArrows: true,
      prevIcon: false,
      nextIcon: false,
      centerActive: false,
      previewImageCarousel: 0,
      previewImages: DEFAULT_WALLPAPERS,
      previewImageSlide: {
        page: 'page-image',
        custom: 'custom-image',
        wallpaper: 'wallpaper'
      },
      uploadedPreviewImageSrc: null,
      selectedPreviewImageFile: null
    }
  },
  computed: {
    ...mapGetters('story', ['story']),
    title: function() {
      return this.isPublished ? 'Invite Collaborators' : 'Publish Story'
    },
    theme: function() {
      return this.isPublished ? 'secondary' : 'primary'
    },
    previewImageSrc: {
      get() {
        log('in previewImageSrc get', this.page.likes)
        if (this.uploadedPreviewImageSrc) {
          return this.uploadedPreviewImageSrc
        } else {
          return '/img/missing-image.png'
        }
      },
      set(val) {
        log('in previewImageSrc set', val)

        if (val) {
          this.uploadedPreviewImageSrc = val
        }
      }
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.init()
    })
  },
  created: function() {},
  methods: {
    init() {
      log('in init')
      if (this.page.image && this.page.image.ref) {
        this.pageImageSrc = this.page.image.ref
      }
    },
    findImageFilenameKey() {
      if (this.page.image && this.page.image.filename) {
        const filenameKey = this.page.image.filename.split('.').shift()
        return findImageByOid(filenameKey)
      } else {
        return Promise.resolve()
      }
    },
    getSelectedPreviewImageSrc() {
      const selectedPreviewImageSlide = this.getSelectedPreviewImageSlide()
      log('selectedPreviewImageSlideL', selectedPreviewImageSlide)
      if (selectedPreviewImageSlide === this.previewImageSlide.page) {
        return this.pageImageSrc
      } else if (selectedPreviewImageSlide === this.previewImageSlide.custom) {
        return this.uploadedPreviewImageSrc
      } else {
        let startingIndex = 1
        if (this.pageImageSrc) {
          startingIndex = 2
        }
        return this.previewImages[this.previewImageCarousel - startingIndex]
      }
    },
    publishAndInvite() {
      log('page already published just need to send invitation')
      this.inviteSwitch = true
      this.publish()
    },
    publish() {
      log('getSelectedPreviewImageSrc', this.getSelectedPreviewImageSrc())

      if (this.summary) {
        const selectedPreviewImage = this.getSelectedPreviewImageSrc()
        if (selectedPreviewImage) {
          const selectedPreviewImageSlide = this.getSelectedPreviewImageSlide()
          log('selectedPreviewImageSlide:', selectedPreviewImageSlide)

          if (selectedPreviewImageSlide === this.previewImageSlide.page) {
            this.findImageFilenameKey()
              .then(imageSnapshot => {
                if (imageSnapshot && imageSnapshot.exists) {
                  this.publishPagePreview({
                    previewImageUrl: imageSnapshot.data().previewUrl,
                    previewImageOid: imageSnapshot.id
                  })
                }
              })
              .catch(error => {
                log('There was an error publishing page', error)
                this.$toast.error(error.message)
              })
          } else if (
            selectedPreviewImageSlide === this.previewImageSlide.custom
          ) {
            this.uploadPreviewImage().then(imageData => {
              log('uploaded preview image, imageData:', imageData)
              if (imageData) {
                this.publishPagePreview({
                  previewImageUrl: imageData.ref,
                  previewImageOid: imageData.filename
                })
              } else {
                this.$toast.error('There was an error uploading preview image')
              }
            })
          } else {
            this.publishPagePreview({
              previewWallpaperImage: selectedPreviewImage
            })
          }
        } else {
          this.$toast.error(
            'A preview image needs to be selected in order to publish page'
          )
        }
      } else {
        this.$toast.error(
          'Please enter a short summary of your page you are going to publish'
        )
      }
    },
    publishPagePreview(previewImageData) {
      let keywords = []
      let authorTags = []
      log('inviteSwitch', this.inviteSwitch)

      log('publish page:', this.summary)
      keywords = stringUtils.findKeywords(this.summary)
      authorTags = stringUtils.findAuthorTags(this.summary)

      const preview = {
        storyOid: this.story.id,
        chapterOid: this.page.chapterOid,
        pageOid: this.page.id,
        title: this.story.title,
        summary: this.summary,
        uid: this.uid,
        userDisplayName: this.userDisplayName,
        previewImageUrl: previewImageData.previewImageUrl
          ? previewImageData.previewImageUrl
          : '',
        imageFilenameOid: previewImageData.previewImageOid
          ? previewImageData.previewImageOid
          : '',
        created: Date.now(),
        keywords: keywords.map(keyword => keyword.toLowerCase()),
        authorTags: authorTags,
        invite: this.inviteSwitch,
        wallpaperUrl: previewImageData.previewWallpaperImage
          ? previewImageData.previewWallpaperImage
          : ''
      }

      log('publishing page with preview:', preview)
      publishPage(preview)
        .then(() => {
          this.$emit('published', false)
          this.closeDialog()
          this.$toast.success('Story published')
        })
        .catch(error => {
          log('There was an error publishing page', error)
          this.$toast.error(error.message)
        })
    },
    closeDialog() {
      this.$emit('close')
    },
    openFileUpload() {
      log('openFileUpload')
      // this.$refs.imageUploader.value = ''
      this.$refs.imageUploader.click()
    },
    previewImageSelected(e) {
      log('previewImageSelected')
      const imageFile = e.target.files[0]
      const limit = 2000000
      if (imageFile) {
        if (imageFile.size > limit) {
          this.$toast.error(
            `The file is over the ${limit / 1000 / 1000}MB limit`
          )
        } else if (!imageFile.type.startsWith('image/')) {
          this.$toast.error(`Please upload a valid image`)
        } else {
          this.uploadedPreviewImageFile = imageFile
          this.previewImageSrc = URL.createObjectURL(imageFile)
        }
      } else {
        this.$toast.error('No preview image selected')
      }
    },
    getSelectedPreviewImageSlide() {
      if (this.pageImageSrc && this.previewImageCarousel === 0) {
        return this.previewImageSlide.page
      } else if (
        this.uploadedPreviewImageSrc &&
        this.uploadedPreviewImageFile &&
        ((!this.pageImageSrc && this.previewImageCarousel === 0) ||
          (this.pageImageSrc && this.previewImageCarousel === 1))
      ) {
        return this.previewImageSlide.custom
      } else {
        return this.previewImageSlide.wallpaper
      }
    },
    uploadPreviewImage() {
      if (this.uploadedPreviewImageFile) {
        return uploadImage(this.uploadedPreviewImageFile).then(result => {
          log('uploaded image:', result)

          this.uploadedPreviewImageFile = null

          const previewImageData = {
            filename: result.filename,
            ref: result.downloadUrl,
            created: Date.now()
          }

          return previewImageData
        })
      } else {
        log('selectedPreviewImageFile not set therefore not uploading')
        return Promise.resolve()
        // return Promise.reject(new Error('File is not initialised'))
      }
    }
  }
}
</script>
<style>
.preview-image-item {
  cursor: pointer;
}
</style>
