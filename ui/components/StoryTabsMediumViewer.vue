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
              <v-btn
                slot="activator"
                icon
                dark
                :color="!isImageViewer ? 'green' : ''"
                @click.native="isImageViewer = false">
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
          <story-tabs-medium-viewer-image
            v-show="isImageViewer"
            :image-src="previewImageSrc" />
          <story-tabs-medium-viewer-book
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
import StoryTabsMediumViewerBook from '~/components/StoryTabsMediumViewerBook'
import StoryTabsMediumViewerImage from '~/components/StoryTabsMediumViewerImage'
import UploadButton from '~/components/UploadButton'
import { updatePage } from '~/api/service/page'
import { uploadPageBook } from '~/api/service/book'
import { uploadPageImage } from '~/api/service/image'
import { updateStory } from '~/api/service/story'

export default {
  name: 'StoryTabsMediumViewer',
  components: {
    StoryTabsMediumViewerBook,
    StoryTabsMediumViewerImage,
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
    hasStoryCover: {
      type: Boolean,
      default: true
    },
    dialog: {
      type: Boolean,
      default: false
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
      isImageViewer: true
    }
  },
  computed: {
    ...mapGetters('modules/story', [
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
        if (this.isImageViewer) {
          reader.readAsDataURL(file)
        } else {
          reader.readAsArrayBuffer(file)
        }
      }
    },
    saveMediaFile () {
      if (this.isImageViewer) {
        this.saveImageFile()
      } else {
        this.saveBookFile()
      }
    },
    saveImageFile () {
      console.log('saving image')
      if (this.mediaFile) {
        uploadPageImage(this.pageOid, this.currentImageOid, this.mediaFile).then((result) => {
          EventBus.$emit('storyImageFileKey', {
            filenameKey: result.filenameKey,
            imageSrc: result.downloadUrl
          })
          this.closeDialog()
        }).catch((error) => {
          console.log('There was an error uploading page image', error)
          this.$toast.error(error.message)
        })
      } else {
        this.$toast.error('Image file not set')
      }
    },
    saveBookFile () {
      console.log('saving book')
      if (this.mediaFile) {
        uploadPageBook(this.pageOid, this.currentBookOid, this.mediaFile).then((result) => {
          EventBus.$emit('storyBookFileKey', {
            filenameKey: result.filenameKey,
            bookSrc: result.downloadUrl
          })
          this.closeDialog()
        }).catch((error) => {
          console.log('There was an error uploading page book', error)
          this.$toast.error(error.message)
        })
      } else {
        this.$toast.error('Book file not set')
      }
    },
    saveImageReference (imageUrl, filename) {
      console.log('ImageURL:', imageUrl)

      const pageImageData = {
        image: {
          filename: filename,
          ref: imageUrl,
          created: Date.now()
        }
      }

      updatePage(this.pageOid, pageImageData).then(() => {
        if (!this.hasStoryCover) {
          // if no cover exist then set this image to the cover
          return updateStory(this.storyOid, {
            cover: {
              chapterOid: this.chapterOid,
              pageOid: this.pageOid,
              mediaFilename: filename,
              imageRef: imageUrl
            }
          })
        } else {
          return Promise.resolve()
        }
      }).then(() => {
        this.$toast.success('Image updated')
      }).catch((error) => {
        console.log('There was an error updating story with image details', error)
        this.$toast.error(error.message)
      })
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
</style>
