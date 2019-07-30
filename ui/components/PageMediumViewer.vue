<template>
  <base-medium-viewer
    :dialog="dialog"
    :read-only="readOnly"
    :title="story.title"
    :user="user"
    :is-book-enabled="!readOnly || !!bookSrc"
    :is-image-enabled="!readOnly || !!imageSrc"
    :is-rich-text-enabled="!readOnly || !!richTextSrc"
    @on-upload-preview="onUploadPreview"
    @save="saveMedia"
    @close="$emit('close')"
  >
    <template #toolbar-custom-items="slotProps">
      <v-divider
        v-if="!readOnly && isMediaImageType(slotProps.activeMedium)"
        class="mx-2"
        vertical
      />
      <v-item-group v-if="!readOnly" align-center>
        <v-item v-if="isMediaImageType(slotProps.activeMedium)" align-center>
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-checkbox
                v-model="isCover"
                :label="`Cover`"
                class="toolbar-checkbox hidden-sm-and-down"
                v-on="on"
              />
              <v-checkbox
                v-model="isCover"
                align-center
                class="toolbar-checkbox hidden-md-and-up"
                v-on="on"
              />
            </template>
            <span class="hidden-sm-and-down">Cover</span>
          </v-tooltip>
        </v-item>
        <v-item v-if="isMediaRichType(slotProps.activeMedium)">
          <v-btn
            flat
            class="toolbar-custom-btn"
            @click="previewRichTextContent"
          >
            <v-icon>
              {{ isRichTextPreview ? 'create' : 'notes' }}
            </v-icon>
            <span class="pl-2 hidden-sm-and-down">{{ isRichTextPreview ? 'Editor' : 'Preview' }}</span>
          </v-btn>
        </v-item>
      </v-item-group>
    </template>

    <template #content-container="slotProps">
      <medium-viewer-image
        v-show="isMediaImageType(slotProps.activeMedium)"
        :src="imageSrc"
      />
      <medium-viewer-book
        v-show="isMediaBookType(slotProps.activeMedium)"
        :src="bookSrc"
        :fileType="bookType"
      />
      <medium-viewer-rich-text
        v-show="isMediaRichType(slotProps.activeMedium)"
        :read-only="readOnly"
        :src="richTextSrc"
        @save="saveRichText"
      />
    </template>
  </base-medium-viewer>
</template>

<script>
import { mapGetters } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import debug from 'debug'
import MediumViewerMixin from '../mixins/MediumViewerMixin'
import BaseMediumViewer from '~/components/BaseMediumViewer'
import MediumViewerBook from '~/components/MediumViewerBook'
import MediumViewerImage from '~/components/MediumViewerImage'
import { uploadPageBook } from '~/api/service/book'
import { uploadPageImage } from '~/api/service/image'
import { uploadPageRichText } from '~/api/service/rich-text'
import MediumViewerRichText from '~/components/MediumViewerRichText'
import { deleteCover, updateStory } from '~/api/service/story'

const log = debug('app:components/PageMediumViewer')

export default {
  name: 'PageMediumViewer',
  components: {
    BaseMediumViewer,
    MediumViewerBook,
    MediumViewerImage,
    MediumViewerRichText
  },
  mixins: [MediumViewerMixin],
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
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
      origin: 'page',
      file: null,
      richTextContent: null,
      imageDialog: false,
      bookPreviewSrc: '',
      bookFileType: '',
      isCover: false,
      isRichTextPreview: false,
      hasBookChanged: false,
      hasImageChanged: false
    }
  },
  computed: {
    ...mapGetters('story', ['story']),
    imageSrc: function() {
      if (this.page.image && this.page.image.ref) {
        return this.page.image.ref
      }
      return ''
    },
    bookSrc() {
      if (this.page.book && this.page.book.ref) {
        return this.page.book.ref
      } else {
        return ''
      }
    },
    bookType() {
      if (this.page.book && this.page.book.contentType) {
        return this.page.book.contentType
      } else {
        return ''
      }
    },
    richTextSrc() {
      if (this.page.richText && this.page.richText.ref) {
        return this.page.richText.ref
      } else {
        return ''
      }
    },
    readOnly: function() {
      return this.page.uid !== this.user.uid
    }
  },
  methods: {
    onUploadPreview(file) {
      log('in onUploadPreview')
      this.file = file
      EventBus.$emit(`upload-preview-updated-${this.origin}`, {
        file: file
      })
      if (this.isImage(file.type)) {
        this.hasImageChanged = true
      }
      if (this.isBook(file.type)) {
        this.hasBookChanged = true
      }
    },
    saveMedia(activeMedium) {
      if (this.isMediaBookType(activeMedium)) {
        this.saveBookFile().then(() => {
          this.$toast.success('Book updated')
        })
      } else if (this.isMediaImageType(activeMedium)) {
        this.saveImageFile().then(() => {
          this.$toast.success('Image updated')
        })
      } else if (this.isMediaRichType(activeMedium)) {
        EventBus.$emit('rich-text-save')
      }
    },
    saveImageFile() {
      if (this.file && this.hasImageChanged) {
        return uploadPageImage(
          this.page.id,
          this.page.image.filename,
          this.file
        )
          .then(result => {
            EventBus.$emit('story-image-file-key', {
              filenameKey: result.filenameKey,
              imageSrc: result.downloadUrl
            })
            this.hasImageChanged = false
          })
          .then(() => {
            log('imageSrc + filename:', this.imageSrc, this.pageImageFilename())
            return this.saveCover(this.imageSrc, this.pageImageFilename())
          })
          .catch(error => {
            log('There was an error uploading page image', error)
            this.$toast.error(error.message)
          })
      } else {
        return this.saveCover(this.imageSrc, this.pageImageFilename())
          .then(() => {
            log('Cover saved')
          })
          .catch(error => {
            log('There was an error saving book cover', error)
            this.$toast.error(error.message)
          })
      }
    },
    saveCover(imageUrl, filename) {
      if (this.isCover && imageUrl) {
        return updateStory(this.page.storyOid, {
          cover: {
            chapterOid: this.page.chapterOid,
            pageOid: this.page.id,
            filename: filename,
            ref: imageUrl
          }
        })
      } else {
        return deleteCover(this.page.storyOid)
      }
    },
    saveBookFile() {
      if (this.file && this.hasBookChanged) {
        return uploadPageBook(this.page.id, this.file)
          .then(result => {
            EventBus.$emit('story-book-file-key', {
              filenameKey: result.filenameKey,
              bookSrc: result.downloadUrl
            })
            this.hasBookChanged = false
          })
          .catch(error => {
            log('There was an error uploading page book', error)
            this.$toast.error(error.message)
          })
      } else {
        return Promise.resolve()
      }
    },
    saveRichText(content) {
      log('Saving Rich Text', content)
      if (content) {
        uploadPageRichText(this.page.id, content)
          .then(result => {
            EventBus.$emit('story-rich-text-file-key', {
              filenameKey: result.filenameKey,
              richTextSrc: result.downloadUrl
            })
          })
          .catch(error => {
            log('There was an error uploading rich text ', error)
            this.$toast.error(error.message)
          })
          .then(() => {
            this.$toast.success('Story was saved successfully')
          })
      }
    },
    previewRichTextContent() {
      log('In preview Rich Text')
      this.isRichTextPreview = !this.isRichTextPreview
      EventBus.$emit(`rich-text-preview-${this.origin}`, {
        isPreview: this.isRichTextPreview
      })
    },
    pageImageFilename() {
      if (this.page.image && this.page.image.filename) {
        return this.page.image.filename
      } else {
        return ''
      }
    }
  }
}
</script>
<style>
</style>
