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
              align="center"
              class="mt-4 mb-6"
              no-gutters
            >
              <v-col
                v-if="isQuotePage"
                align="center"
              >
                <v-sheet
                  :color="page.quote.background"
                  height="200"
                  width="200"
                  tile
                  justify-center
                >
                  <div
                    class="quote-block text-center pa-2 pt-0"
                    :class="page.quote.color === '#000000' ? 'black--text' : 'white--text'"
                  >
                    <span style="white-space: pre-line" class="quote-txt subtitle-1">{{ page.quote.src }}</span>
                  </div>
                </v-sheet>
              </v-col>
              <v-col v-else>
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
                    value="page-image"
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
                  <v-carousel-item
                    value="file-upload-image"
                    class="preview-image-item"
                  >
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
                    v-for="(color, idx) in backgroundColors"
                    :key="color"
                    :value="'color-' + idx"
                  >
                    <v-row
                      class="fill-height"
                      align="center"
                      justify="center"
                    >
                      <v-sheet
                        :color="color"
                        height="200"
                        width="200"
                        tile
                        justify-center
                      >
                        <div class="text-center pa-2 body-2">
                          <span style="white-space: pre-line">{{ summary }}</span>
                        </div>
                      </v-sheet>
                    </v-row>
                  </v-carousel-item>
                  <v-carousel-item
                    v-for="(previewImage, idx) in previewImages"
                    :key="previewImage"
                    :value="'wallpaper-' + idx"
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
                      >
                        <v-container fill-height fluid>
                          <v-layout
                            fill-height
                          >
                            <v-flex xs12 align-end flexbox>
                              <span style="white-space: pre-line" class="headline no-image-text">{{ summary }}</span>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-img>
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
                  :color="theme"
                  label="Summary"
                  maxlength="500"
                  rows="5"
                  row-height="24"
                />
              </v-col>
            </v-row>
            <slot name="form-custom-input" />
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <slot name="form-action-buttons" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import debug from 'debug'

import { BACKGROUND_COLOURS } from '~/api/service/preview'
import { DEFAULT_WALLPAPERS } from '~/api/service/page'

const log = debug('app:components/PagePublish')

export default {
  name: 'BasePagePublish',
  props: {
    value: {
      type: Object,
      required: true
    },
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
    title: {
      type: String,
      default: 'Publish Page'
    },
    userDisplayName: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'primary'
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
      previewImageCarousel: 'page-image',
      previewImages: DEFAULT_WALLPAPERS,
      previewImageSlide: {
        page: 'page-image',
        color: 'color',
        upload: 'custom-image',
        wallpaper: 'wallpaper'
      },
      colorBackground: '#26c6da',
      uploadedPreviewImageSrc: null,
      selectedPreviewImageFile: null
    }
  },
  computed: {
    backgroundColors() {
      return BACKGROUND_COLOURS
    },
    backgroundWallpapers() {
      return DEFAULT_WALLPAPERS
    },
    previewImageSrc: {
      get() {
        log('in previewImageSrc get', this.page.likes)
        // todo ?? this.contribution.image.ref ....
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
    },
    isQuotePage: function() {
      return this.page.quote && this.page.quote.src
    }
  },
  watch: {
    previewImageCarousel: function(idx) {
      log('in watch previewImageCarousel', idx)
      this.$emit('input', this.getPublishData())
    },
    summary: function(idx) {
      log('in watch previewImageCarousel', idx)
      this.$emit('input', this.getPublishData())
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
      if (this.page.image && this.page.image.ref) {
        this.pageImageSrc = this.page.image.ref
        this.pageImageFilename = this.page.image.filename
        this.previewImageCarousel = 'page-image'
      } else if (this.value.background.type) {
        this.previewImageCarousel = this.value.background.type
      } else {
        this.previewImageCarousel = 'file-upload-image'
      }
      this.summary = this.value.summary
    },
    // findImageFilenameKey() {
    //   if (this.page.image && this.page.image.filename) {
    //     const filenameKey = this.page.image.filename.split('.').shift()
    //     return findImageByOid(filenameKey)
    //   } else {
    //     return Promise.resolve()
    //   }
    // },
    getPublishData() {
      // const selectedPreviewImageSlide = this.getSelectedPreviewImageSlide()
      // log('selectedPreviewImageSlideL', selectedPreviewImageSlide)

      const publishData = {
        background: this.getBackgroundData(),
        summary: this.summary
      }

      log('publishData:', publishData)

      return publishData
    },
    getFontColor(backgroundColor) {
      return backgroundColor === '#ffffff' ? '#000000' : '#ffffff'
    },
    getBackgroundData() {
      if (this.isCarouselColor()) {
        return {
          type: 'color',
          val: this.backgroundColors[this.getCarouselLastIndex()],
          font: {
            color: this.getFontColor(this.backgroundColors[this.getCarouselLastIndex()])
          }
        }
      } else if (this.isCarouselFileUploadImage()) {
        log(
          'in isCarouselFileUploadImage',
          this.uploadedPreviewImageSrc,
          this.uploadedPreviewImageFile
        )
        return {
          type: 'file-upload-image',
          val: this.uploadedPreviewImageSrc,
          file: this.uploadedPreviewImageFile
        }
      } else if (this.isCarouselPageImage()) {
        return {
          type: 'page-image',
          val: this.pageImageSrc,
          id: this.pageImageFilename
            ? this.pageImageFilename.split('.').shift()
            : null
        }
      } else if (this.isCarouselWallpaper()) {
        return {
          type: 'wallpaper',
          val: this.backgroundWallpapers[this.getCarouselLastIndex()]
        }
      } else {
        return {}
      }
    },
    getCarouselLastIndex() {
      return this.previewImageCarousel.substring(
        this.previewImageCarousel.lastIndexOf('-') + 1
      )
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
          log('sssssssssssssssssss', imageFile)
          this.uploadedPreviewImageFile = imageFile
          this.previewImageSrc = URL.createObjectURL(imageFile)
        }
      } else {
        this.$toast.error('No preview image selected')
      }
    },
    isCarouselPageImage() {
      return this.previewImageCarousel.startsWith('page-image')
    },
    isCarouselFileUploadImage() {
      return this.previewImageCarousel.startsWith('file-upload-image')
    },
    isCarouselColor() {
      return this.previewImageCarousel.startsWith('color')
    },
    isCarouselWallpaper() {
      return this.previewImageCarousel.startsWith('wallpaper')
    }
    // uploadPreviewImage() {
    //   if (this.uploadedPreviewImageFile) {
    //     return uploadImage(this.uploadedPreviewImageFile).then(result => {
    //       log('uploaded image:', result)
    //
    //       this.uploadedPreviewImageFile = null
    //
    //       const previewImageData = {
    //         filename: result.filename,
    //         ref: result.downloadUrl,
    //         created: Date.now()
    //       }
    //
    //       return previewImageData
    //     })
    //   } else {
    //     log('selectedPreviewImageFile not set therefore not uploading')
    //     return Promise.resolve()
    //   }
    // }
  }
}
</script>
<style>
.preview-image-item {
  cursor: pointer;
}

.quote-block {
  line-height: 200px;
  height: 200px;
  overflow: hidden;
}

.quote-txt {
  display: inline-block;
  vertical-align: middle;
}
</style>
