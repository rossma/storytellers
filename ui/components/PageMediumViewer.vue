<template>
  <base-medium-viewer
    :dialog="dialog"
    :read-only="readOnly"
    :title="story.title"
    :user="user"
    :initial-medium="selectedMedium"
    :is-book-enabled="isBookEnabled"
    :is-image-enabled="isImageEnabled"
    :is-rich-text-enabled="isRichTextEnabled"
    @on-upload-preview="onUploadPreview"
    @save="saveMedia"
    @close="closeDialog()"
  >
    <template #toolbar-custom-items="slotProps">
      <v-divider
        v-if="!readOnly && isMediaImageType(slotProps.activeMedium)"
        class="mx-2"
        vertical
      />
      <span v-if="!readOnly && isMediaImageType(slotProps.activeMedium)" align-center>
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-checkbox
              v-model="isCover"
              :label="coverCheckboxLabel"
              class="toolbar-checkbox"
              v-on="on"
            />
          </template>
          <span class="hidden-sm-and-down">Cover</span>
        </v-tooltip>
      </span>
      <v-btn
        v-if="isMediaRichType(slotProps.activeMedium)"
        text
        class="toolbar-custom-btn"
        @click="previewRichTextContent"
      >
        <v-icon>
          {{ isRichTextPreview ? 'mdi-pencil-outline' : 'mdi-note-text' }}
        </v-icon>
        <span class="pl-2 hidden-sm-and-down">{{ isRichTextPreview ? 'Editor' : 'Preview' }}</span>
      </v-btn>
    </template>

    <template #content-container="slotProps">
      <medium-viewer-quote
        v-show="isMediaQuoteType(slotProps.activeMedium)"
        v-model="quote"
      />
      <medium-viewer-image
        v-show="isMediaImageType(slotProps.activeMedium)"
        :src="imageSrc"
      />
      <medium-viewer-book
        v-show="isMediaBookType(slotProps.activeMedium)"
        :src="bookSrc"
        :file-type="bookType"
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
import MediumViewerQuote from '~/components/MediumViewerQuote'
import { uploadPageBook } from '~/api/service/book'
import { uploadPageImage } from '~/api/service/image'
import { updatePage } from '~/api/service/page'
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
    MediumViewerQuote,
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
    selectedMedium: {
      type: Number,
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
      hasImageChanged: false,
      quote: {
        src: '',
        background: '',
        color: ''
      }
    }
  },
  computed: {
    ...mapGetters('story', ['story']),
    isBookEnabled: function() {
      return this.isMediaBookType(this.selectedMedium)
      // && (!this.readOnly || !!this.bookSrc)
    },
    isImageEnabled: function() {
      return this.isMediaImageType(this.selectedMedium)
      // && (!this.readOnly || !!this.imageSrc)
    },
    isRichTextEnabled: function() {
      return this.isMediaRichType(this.selectedMedium)
      // && (!this.readOnly || !!this.richTextSrc)
    },

    // quoteSrc: function() {
    //   if (this.page.quote && this.page.quote.src) {
    //     return this.page.quote.src
    //   }
    //   return ''
    // },
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
    },
    coverCheckboxLabel() {
      if (
        this.$vuetify.breakpoint.name === 'xs' ||
        this.$vuetify.breakpoint.name === 'sm'
      ) {
        return ''
      } else {
        return 'Cover'
      }
    }
  },
  methods: {
    showMedium(medium) {
      log('show medium', medium)
    },
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
          this.closeDialog()
        })
      } else if (this.isMediaImageType(activeMedium)) {
        this.saveImageFile().then(() => {
          this.$toast.success('Image updated')
          this.closeDialog()
        })
      } else if (this.isMediaRichType(activeMedium)) {
        EventBus.$emit('rich-text-save')
        this.closeDialog()
      } else if (this.isMediaQuoteType(activeMedium)) {
        this.saveQuote(this.quote)
          .then(() => {
            this.quote = {
              src: '',
              background: '',
              color: ''
            }
            this.$toast.success('Quote added')
            this.closeDialog()
          })
          .catch(err => {
            log('Error adding quote', err)
            this.$toast.error(`Error adding quote`)
          })
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
              bookSrc: result.downloadUrl,
              contentType: result.contentType
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
    saveQuote(quote) {
      log('Saving quote', quote)

      if (quote) {
        log('adding quote:', quote)
        return updatePage(this.page.id, { quote: quote })
      } else {
        return Promise.reject(new Error('Quote is not initialised'))
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
    },
    closeDialog() {
      this.$emit('close')
    }
  }
}
</script>
<style>
</style>
