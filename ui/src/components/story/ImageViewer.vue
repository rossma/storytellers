<template>
  <v-layout
    row
    justify-center>
    <v-dialog
      v-model="dialog"
      fullscreen
      transition="dialog-bottom-transition"
      :overlay="false">
      <v-card>
        <v-toolbar
          dark
          color="primary">
          <v-btn
            icon
            @click.native="closeDialog()"
            dark>
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Illustration</v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <upload-button
              v-if="editable"
              name="Upload"
              icon="mdi mdi-palette"
              :selected-callback="previewImageFile" />
            <v-btn
              v-if="editable"
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
</template>

<script>
import { EventBus } from '~/utils/event-bus.js'
import UploadButton from '~/components/UploadButton'
import { updatePage } from '~/service/page'
import { deleteImage, uploadStoryImage } from '~/service/image'
import { updateStory } from '~/service/story'

export default {
  name: 'ImageViewer',
  components: {
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
    src: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      imageFile: null,
      imagePreviewSrc: ''
    }
  },
  computed: {
    previewImageSrc: function () {
      if (this.imagePreviewSrc) {
        return this.imagePreviewSrc
      } else {
        return this.src
      }
    }
  },
  methods: {
    closeDialog () {
      // imageDialog = false
      this.$emit('close', false)
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
        if (this.currentImageOid) {
          console.log('Deleting reference to old image')
          deleteImage(this.currentImageOid).then(() => {
            console.log(`Old image with name:${this.currentImageOid} deleted`)
          })
        }
        console.log('uploading image')
        const filenameKey = this.uuidv4()
        const fileExt = this.imageFile.name.split('.').pop()
        uploadStoryImage(this.imageFile, metadata, filenameKey, fileExt).then((downloadUrl) => {
          this.saveImageReference(downloadUrl, `${filenameKey}.${fileExt}`)
        }).catch((error) => {
          this.$toast.error(error.message)
        })
        EventBus.$emit('storyImageFileKey', filenameKey)
        this.closeDialog()
      } else {
        this.$toast.error('Image file not set')
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
              imageFilename: filename,
              imageRef: imageUrl
            }
          })
        } else {
          return Promise.resolve()
        }
      }).then(() => {
        this.$toast.success('Image updated')
      }).catch((error) => {
        this.$toast.error(error.message)
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
