<template>
  <v-layout
    row
    justify-center>
    <v-dialog
      v-model="dialog"
      hide-overlay
      fullscreen
      transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar
          dark
          color="primary">
          <v-btn
            icon
            dark
            @click.native="closeDialog()">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ story.title }}</v-toolbar-title>
          <v-spacer />
          <v-toolbar-items class="medium-viewer-toolbar">
            <v-tooltip bottom>
              <v-checkbox
                slot="activator"
                v-if="editable && isImageViewer"
                :label="`Cover`"
                v-model="isCover">
              </v-checkbox>
              <span>Cover</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                icon
                dark
                :color="!isImageViewer ? 'green' : ''"
                @click.native="initEbook();isImageViewer = false">
                <v-icon>book</v-icon>
              </v-btn>
              <span>Words</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                icon
                dark
                :color="isImageViewer ? 'green' : ''"
                @click.native="isImageViewer = true">
                <v-icon>brush</v-icon>
              </v-btn>
              <span>Pictures</span>
            </v-tooltip>
            <v-tooltip bottom>
              <upload-button
                slot="activator"
                v-if="editable"
                :selected-callback="previewMediaFile"
                icon="folder_open"/>
              <span>Upload</span>
            </v-tooltip>
            <v-btn
              slot="activator"
              v-if="editable"
              dark
              flat
              @click="saveMediaFile">
              <v-icon left>save</v-icon>
              Save
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="text-xs-center">
          <medium-viewer-image
            v-show="isImageViewer"
            :image-src="previewImageSrc" />
          <medium-viewer-book
            v-show="!isImageViewer"
            :book-src="previewBookSrc" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import MediumViewerBook from '~/components/MediumViewerBook'
import MediumViewerImage from '~/components/MediumViewerImage'
import UploadButton from '~/components/UploadButton'
import { uploadPageBook } from '~/api/service/book'
import { uploadPageImage } from '~/api/service/image'
import { deleteCover, updateStory } from '~/api/service/story'

export default {
  name: 'MediumViewer',
  components: {
    MediumViewerBook,
    MediumViewerImage,
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
    }
  },
  data () {
    return {
      // bookPreviewSrc: 'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/pg19033.epub?alt=media&token=06a11974-4ef1-41bf-a11c-b4a573af8f30',
      bookPreviewSrc: null,
      mediaFile: null,
      imagePreviewSrc: '',
      isCover: false,
      isImageViewer: true,
      hasImageChanged: false,
      hasBookChanged: false
    }
  },
  computed: {
    ...mapGetters('story', [
      'story'
    ]),
    previewImageSrc: function () {
      if (this.imagePreviewSrc) {
        return this.imagePreviewSrc
      } else {
        return this.imageSrc
      }
    },
    previewBookSrc: function () {
      if (this.bookPreviewSrc) {
        return this.bookPreviewSrc
      } else {
        return this.bookSrc
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      console.log('MediumViewer:Mounted', this.storyCover)
      this.isCover = this.storyCover && this.storyCover.filename === this.imageFilename ? true : false
    })
  },
  methods: {
    closeDialog () {
      this.$emit('close', false)
    },
    previewMediaFile (file) {
      console.log('in previewMediaFile')
      this.mediaFile = file
      let reader = new FileReader()

      reader.onloadend = () => {
        if (this.isImageViewer) {
          this.imagePreviewSrc = reader.result
        } else {
          EventBus.$emit('epubBookSrc', reader.result)
        }
      }

      if (file) {
        console.log('file size:', file.size)

        const limit = 2000000
        if (file.size > limit) {
          console.log(`file size if over the limit:${limit}`)
          this.$toast.error(`The file is over the ${limit / 1000 / 1000}MB limit`)
        } else {
          console.log('mime type:', file.type)
          if (file.type && file.type.startsWith( 'image/')) {
            this.isImageViewer = true
            this.hasImageChanged = true
            reader.readAsDataURL(file)
          } else if (file.type && file.type.startsWith( 'application/epub')) {
            this.isImageViewer = false
            this.hasBookChanged = true
            reader.readAsArrayBuffer(file)
          } else {
            console.log('unknown file type')
            this.$toast.error(`The file is an supported file type`)
          }
        }

      }
    },
    initEbook () {
      EventBus.$emit('initEbook')
    },
    saveMediaFile () {
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
    saveImageFile () {
      console.log('saving image, cover:', this.isCover)
      if (this.mediaFile && this.hasImageChanged) {
        return uploadPageImage(this.pageOid, this.currentImageOid, this.mediaFile).then((result) => {
          EventBus.$emit('storyImageFileKey', {
            filenameKey: result.filenameKey,
            imageSrc: result.downloadUrl
          })
          this.hasImageChanged = false
          this.closeDialog()
        }).then(() => {
          console.log('imageSrc + filename:', this.imageSrc, this.imageFilename)
          return this.saveCover(this.imageSrc, this.imageFilename)
        }).catch((error) => {
          console.log('There was an error uploading page image', error)
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
        return this.saveCover(this.imageSrc, this.imageFilename).then(() => {
          console.log('Cover saved')
        }).catch((error) => {
          console.log('There was an error saving book cover', error)
          this.$toast.error(error.message)
        })
      }
    },
    saveBookFile () {
      console.log('saving book')
      if (this.mediaFile && this.hasBookChanged) {
        return uploadPageBook(this.pageOid, this.currentBookOid, this.mediaFile).then((result) => {
          EventBus.$emit('storyBookFileKey', {
            filenameKey: result.filenameKey,
            bookSrc: result.downloadUrl
          })
          this.hasBookChanged = false
          this.closeDialog()
        }).catch((error) => {
          console.log('There was an error uploading page book', error)
          this.$toast.error(error.message)
        })
      }
    },
    saveCover (imageUrl, filename) {
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
  margin-top: 8px;
}
/* below is for inpunts in toolbar (in particular checkbox) */
.v-input--selection-controls {
  padding-top: 13px;
}
</style>
