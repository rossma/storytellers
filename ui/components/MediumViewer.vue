<template>
  <v-dialog
    v-model="dialog"
    hide-overlay
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-layout
      dark
      column
      fill-height
    >
      <v-card class="dialog-container">
        <v-toolbar
          dark
          color="primary"
        >
          <v-btn
            icon
            dark
            @click.native="closeDialog()"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ story.title }}</v-toolbar-title>
          <v-spacer />
          <v-toolbar-items class="medium-viewer-toolbar">
            <v-divider
              class="mx-2"
              vertical
            />
            <v-tooltip bottom>
              <v-checkbox
                v-if="editable && isImageViewer"
                slot="activator"
                v-model="isCover"
                :label="`Cover`"
              />
              <span>Cover</span>
            </v-tooltip>
            <v-divider
              class="mx-2"
              vertical
            />
            <v-tooltip bottom>
              <upload-button
                v-if="editable && (isImageViewer || isBookViewer)"
                slot="activator"
                :selected-callback="previewMediaFile"
                icon="cloud_upload"
              />
              <span>Upload</span>
            </v-tooltip>
            <v-divider
              class="mx-2"
              vertical
            />
            <v-btn-toggle
              v-model="activeMedium"
              class="transparent"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    :value="1"
                    flat
                    @click.native="initRich()"
                  >
                    <v-icon>text_format</v-icon>
                  </v-btn>
                </template>
                <span>sssssssssss</span>
              </v-tooltip>
              <v-btn
                :value="2"
                flat
                @click.native="initBook()"
              >
                <v-icon>book</v-icon>
              </v-btn>
              <v-btn
                :value="3"
                flat
                @click.native="initImage()"
              >
                <v-icon>brush</v-icon>
              </v-btn>
            </v-btn-toggle>
            <v-divider
              class="mx-2"
              vertical
            />
            <v-btn
              v-if="editable"
              slot="activator"
              dark
              flat
              @click="saveMediaFile"
            >
              <v-icon left>
                save
              </v-icon>
              Save
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <!--<v-card-text-->
        <!--style="border: 4px solid pink;"-->
        <!--fill-height-->
        <!--class="text-xs-center">-->
        <!--<v-responsive-->
        <!--style="border: 4px solid pink;">-->
        <v-layout
          justify-center
          dark
          fill-height
        >
          <medium-viewer-image
            v-show="isImageViewer"
            :image-src="previewImageSrc"
          />
          <medium-viewer-book
            v-show="isBookViewer"
            :book-src="bookSrc"
            :book-type="previewBookType"
          />
          <medium-viewer-rich-text
            v-show="isRichViewer"
          />
        </v-layout>
        <!--</v-responsive>-->
      </v-card>
    </v-layout>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import MediumViewerBook from '~/components/MediumViewerBook'
import MediumViewerImage from '~/components/MediumViewerImage'
import MediumViewerRichText from '~/components/MediumViewerRichText'
import UploadButton from '~/components/UploadButton'
import { uploadPageBook } from '~/api/service/book'
import { uploadPageImage } from '~/api/service/image'
import { deleteCover, updateStory } from '~/api/service/story'
import debug from 'debug'

const log = debug('app:components/MediumViewer')

export default {
  name: 'MediumViewer',
  components: {
    MediumViewerBook,
    MediumViewerImage,
    MediumViewerRichText,
    UploadButton
  },
  props: {
    storyOid: {
      type: String,
      required: true
    },
    chapterOid: {
      type: String,
      required: true
    },
    pageOid: {
      type: String,
      required: true
    },
    currentImageOid: {
      type: String,
      default: null
    },
    currentBookOid: {
      type: String,
      default: null
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
    dialog: {
      type: Boolean,
      default: false
    },
    imageFilename: {
      type: String,
      default: null
    },
    imageSrc: {
      type: String,
      default: null
    },
    bookSrc: {
      type: String,
      default: null
    },
    bookType: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      activeMedium: 3,
      fileType: null,
      mediaFile: null,
      imagePreviewSrc: '',
      isCover: false,
      isBookViewer: false,
      isImageViewer: true,
      isRichViewer: false,
      hasImageChanged: false,
      hasBookChanged: false
    }
  },
  computed: {
    ...mapGetters('story', ['story']),
    previewImageSrc: function() {
      if (this.imagePreviewSrc) {
        return this.imagePreviewSrc
      } else {
        return this.imageSrc
      }
    },
    previewBookType: function() {
      if (this.fileType) {
        return this.fileType
      } else {
        return this.bookType
      }
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      log('MediumViewer:Mounted', this.storyCover)
      this.isCover =
        this.storyCover && this.storyCover.filename === this.imageFilename
          ? true
          : false

      if (this.bookType) {
        this.fileType = this.bookType
      }
    })
  },
  methods: {
    closeDialog() {
      this.$emit('close', false)
    },
    previewMediaFile(file) {
      log('in previewMediaFile')
      this.mediaFile = file
      let reader = new FileReader()

      reader.onloadend = () => {
        if (this.isImageViewer) {
          this.imagePreviewSrc = reader.result
        } else {
          if (this.previewBookType === 'application/pdf') {
            EventBus.$emit('pdf-book-src', reader.result)
          } else {
            // default is epub
            EventBus.$emit('epub-book-src', reader.result)
          }
        }
      }

      if (file) {
        log('file size:', file.size)

        const limit = 2000000
        if (file.size > limit) {
          log(`file size if over the limit:${limit}`)
          this.$toast.error(
            `The file is over the ${limit / 1000 / 1000}MB limit`
          )
        } else {
          log('mime type:', file.type)
          this.fileType = file.type
          if (file.type && file.type.startsWith('image/')) {
            this.isImageViewer = true
            this.hasImageChanged = true
            reader.readAsDataURL(file)
          } else if (this.isPdf(file.type)) {
            this.isImageViewer = false
            this.hasBookChanged = true
            reader.readAsArrayBuffer(file)
          } else if (this.isEpub(file.type)) {
            this.isImageViewer = false
            this.hasBookChanged = true
            reader.readAsArrayBuffer(file)
          } else {
            log('unknown file type')
            this.$toast.error(`The file is an supported file type`)
          }
        }
      }
    },
    isEpub(type) {
      return type && type.startsWith('application/epub')
    },
    isPdf(type) {
      return type && type.startsWith('application/pdf')
    },
    initImage() {
      this.isBookViewer = false
      this.isImageViewer = true
      this.isRichViewer = false
    },
    initRich() {
      log('RichText editor')
      this.isBookViewer = false
      this.isImageViewer = false
      this.isRichViewer = true
    },
    initBook() {
      if (this.isEpub(this.fileType)) {
        log('emitting event to init ebook')
        EventBus.$emit('init-ebook')
      } else if (this.isPdf(this.fileType)) {
        log('emitting event to init pdf')
        EventBus.$emit('initPdf')
      } else {
        log('Unsupported file type:', this.fileType)
      }
      this.isBookViewer = true
      this.isImageViewer = false
      this.isRichViewer = false
    },
    saveMediaFile() {
      if (this.isImageViewer) {
        this.saveImageFile().then(() => {
          this.$toast.success('Image updated')
        })
      } else {
        this.saveBookFile().then(() => {
          this.$toast.success('Book updated')
        })
      }
    },
    saveImageFile() {
      if (this.mediaFile && this.hasImageChanged) {
        return uploadPageImage(
          this.pageOid,
          this.currentImageOid,
          this.mediaFile
        )
          .then(result => {
            // this.$emit('story-image-file-key', false)
            EventBus.$emit('story-image-file-key', {
              filenameKey: result.filenameKey,
              imageSrc: result.downloadUrl
            })
            this.hasImageChanged = false
            this.closeDialog()
          })
          .then(() => {
            log('imageSrc + filename:', this.imageSrc, this.imageFilename)
            return this.saveCover(this.imageSrc, this.imageFilename)
          })
          .catch(error => {
            log('There was an error uploading page image', error)
            //
            // There was an error uploading page image Error: Function DocumentReference.set() called with invalid data. Data must be an object, but it was: a function
            // at new FirestoreError (vendors.app.js:35053)
            // at ParseContext.push../node_modules/@firebase/firestore/dist/esm/src/api/user_data_converter.js.ParseContext.createError (vendors.app.js:20131)
            // at validatePlainObject (vendors.app.js:20440)
            // at UserDataConverter.push../node_modules/@firebase/firestore/dist/esm/src/api/user_data_converter.js.UserDataConverter.parseMergeData (vendors.app.js:20184)
            // at DocumentReference.push../node_modules/@firebase/firestore/dist/esm/src/api/database.js.DocumentReference.set (vendors.app.js:18777)
            // at updateStory (profile.b741b9b79028750abcb1.hot-update.js:47)
            // at VueComponent.saveCover (index.js:1471)
            // at index.js:1414
            this.$toast.error(error.message)
          })
      } else {
        return this.saveCover(this.imageSrc, this.imageFilename)
          .then(() => {
            log('Cover saved')
          })
          .catch(error => {
            log('There was an error saving book cover', error)
            this.$toast.error(error.message)
          })
      }
    },
    saveBookFile() {
      log('saving book')
      if (this.mediaFile && this.hasBookChanged) {
        return uploadPageBook(this.pageOid, this.currentBookOid, this.mediaFile)
          .then(result => {
            EventBus.$emit('story-book-file-key', {
              filenameKey: result.filenameKey,
              bookSrc: result.downloadUrl
            })
            this.hasBookChanged = false
            this.closeDialog()
          })
          .catch(error => {
            log('There was an error uploading page book', error)
            this.$toast.error(error.message)
          })
      }
    },
    saveCover(imageUrl, filename) {
      if (this.isCover && this.imageSrc && this.imageFilename) {
        return updateStory(this.storyOid, {
          cover: {
            chapterOid: this.chapterOid,
            pageOid: this.pageOid,
            filename: filename,
            ref: imageUrl
          }
        })
      } else {
        return deleteCover(this.storyOid)
      }
    }
  }
}
</script>
<style>
.v-toolbar__title {
  /*margin-right: 10px;*/
}

.medium-viewer-toolbar .v-tooltip {
  /*margin-top: 8px;*/
}

/* below is for inpunts in toolbar (in particular checkbox) */
.v-input--selection-controls {
  padding-top: 13px;
}

.dialog-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
