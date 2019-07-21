<template>
  <div>
    <base-medium-viewer
      :dialog="dialog"
      :read-only="readOnly"
      :title="story.title"
      :theme="'secondary'"
      :user="user"
      :initial-medium="activeMedium"
      :is-book-enabled="!readOnly || !!bookSrc"
      :is-image-enabled="!readOnly || !!imageSrc"
      :is-rich-text-enabled="!readOnly || !!richTextSrc"
      :can-delete="canDelete"
      @on-upload-preview="onUploadPreview"
      @save="saveMediaDialog"
      @close="close()"
    >
      <template #toolbar-custom-items="slotProps">
        <v-divider
          v-if="!readOnly && isMediaRichType(slotProps.activeMedium)"
          class="mx-2"
          vertical
        />
        <v-item-group v-if="!readOnly">
          <v-item v-if="isMediaRichType(slotProps.activeMedium)">
            <v-btn
              flat
              class="toolbar-custom-btn"
              @click="previewRichTextContent"
            >
              <v-icon left>
                {{ isRichTextPreview ? 'create' : 'pageview' }}
              </v-icon>
              {{ isRichTextPreview ? 'Editor' : 'Preview' }}
            </v-btn>
          </v-item>
        </v-item-group>

        <v-btn
          v-if="canDelete"
          dark
          flat
          @click="pageContributionDeleteDialog = true"
        >
          <v-icon left>
            delete
          </v-icon>
          Delete
        </v-btn>
      </template>

      <template #content-container="slotProps">
        <medium-viewer-image
          v-show="isMediaImageType(slotProps.activeMedium)"
          :src="imageSrc"
          :origin="origin"
        />
        <medium-viewer-book
          v-show="isMediaBookType(slotProps.activeMedium)"
          :src="bookSrc"
          :file-type="bookType"
          :origin="origin"
        />
        <medium-viewer-rich-text
          v-show="isMediaRichType(slotProps.activeMedium)"
          :read-only="readOnly"
          :src="richTextSrc"
          :origin="origin"
          @save="saveRichText"
        />
      </template>
    </base-medium-viewer>

    <page-contribution-save-dialog
      :dialog="pageContributionSaveDialog"
      @save="saveMedia"
      @close="pageContributionSaveDialog = false"
    />

    <page-contribution-delete-dialog
      :dialog="pageContributionDeleteDialog"
      @delete="deleteMedia"
      @close="pageContributionDeleteDialog = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import debug from 'debug'
import stringUtils from '~/utils/string'
import MediumViewerMixin from '../mixins/MediumViewerMixin'
import BaseMediumViewer from '~/components/BaseMediumViewer'
import MediumViewerBook from '~/components/MediumViewerBook'
import MediumViewerImage from '~/components/MediumViewerImage'
import PageContributionDeleteDialog from '~/components/PageContributionDeleteDialog'
import PageContributionSaveDialog from '~/components/PageContributionSaveDialog'
import { uploadImage } from '~/api/service/image'
import { uploadBook } from '~/api/service/book'
import { uploadJson } from '~/api/service/rich-text'
import {
  addPage,
  deletePage,
  getRandomPreviewWallpaper
} from '~/api/service/page'
import MediumViewerRichText from '~/components/MediumViewerRichText'

const log = debug('app:components/PageContributionMediumViewer')

export default {
  name: 'PageMediumViewer',
  components: {
    BaseMediumViewer,
    MediumViewerBook,
    MediumViewerImage,
    MediumViewerRichText,
    PageContributionDeleteDialog,
    PageContributionSaveDialog
  },
  mixins: [MediumViewerMixin],
  props: {
    activeMedium: {
      type: Number,
      default: 3
    },
    dialog: {
      type: Boolean,
      default: false
    },
    origin: {
      type: String,
      default: 'contribution'
    },
    contribution: {
      type: Object,
      required: true
    },
    pagesRef: {
      type: Object,
      required: true
    },
    readOnly: {
      type: Boolean,
      default: true
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      mediaToSave: this.activeMedium,
      file: null,
      richTextContent: null,
      imageDialog: false,
      bookPreviewSrc: '',
      bookFileType: '',
      isRichTextPreview: false,
      hasBookChanged: false,
      isReadOnly: true,
      pageContributionSaveDialog: false,
      pageContributionDeleteDialog: false,
      savedPart: null
    }
  },
  computed: {
    ...mapGetters('story', ['story']),
    imageSrc: function() {
      if (this.contribution.image && this.contribution.image.ref) {
        return this.contribution.image.ref
      }
      return ''
    },
    bookSrc() {
      if (this.contribution.book && this.contribution.book.ref) {
        return this.contribution.book.ref
      } else {
        return ''
      }
    },
    bookType() {
      if (this.contribution.book && this.contribution.book.contentType) {
        return this.contribution.book.contentType
      } else {
        return ''
      }
    },
    richTextSrc() {
      if (this.contribution.richText && this.contribution.richText.ref) {
        return this.contribution.richText.ref
      } else {
        return ''
      }
    },
    canDelete() {
      return this.contribution.id && this.user.uid === this.contribution.uid
    }
  },
  methods: {
    onUploadPreview(file) {
      log('in onUploadPreview', this.pagesRef.id)
      this.file = file
      EventBus.$emit('upload-preview-updated', {
        origin: this.origin,
        file: file
      })
    },
    saveMediaDialog(activeMedium) {
      log('saveMediaDialog:', activeMedium)
      this.mediaToSave = activeMedium
      this.pageContributionSaveDialog = true
    },
    saveMedia(summary) {
      log('in save media', this.mediaToSave, summary)

      let keywords = []
      let authorTags = []
      keywords = stringUtils.findKeywords(summary)
      authorTags = stringUtils.findAuthorTags(summary)

      const pageCollaborationPart = {
        invite: false,
        public: true,
        chapterOid: this.contribution.chapterOid,
        storyOid: this.contribution.storyOid,
        richText: {},
        parentPagesOid: this.contribution.parentPagesOid,
        // parentPagesRef: this.contribution.parentPagesRef,
        summary: summary,
        keywords: keywords,
        authorTags: authorTags,
        uid: this.user.uid,
        wallpaperUrl: getRandomPreviewWallpaper()
      }

      if (this.isMediaBookType(this.mediaToSave)) {
        this.saveBookFile(pageCollaborationPart)
          .then(page => {
            log('Page created:', page)
            this.addPageToList(this.enhancePage(page))
            this.$toast.success('Book updated')
          })
          .catch(error => {
            log('Error saving book', error)
            this.$toast.error('Error saving book')
          })
      } else if (this.isMediaImageType(this.mediaToSave)) {
        this.saveImageFile(pageCollaborationPart)
          .then(page => {
            log('Page created:', page)
            this.addPageToList(this.enhancePage(page))
            this.$toast.success('Image updated')
          })
          .catch(error => {
            log('Error saving image', error)
            this.$toast.error('Error saving image')
          })
      } else if (this.isMediaRichType(this.mediaToSave)) {
        this.savedPart = pageCollaborationPart
        EventBus.$emit('rich-text-save')
      }
    },
    saveBookFile(part) {
      if (this.file) {
        return uploadBook(this.file).then(result => {
          log('uploaded book:', result)
          log(`Creating book`)

          const pageBookData = {
            book: {
              filename: result.filename,
              contentType: result.contentType,
              ref: result.downloadUrl,
              created: Date.now()
            }
          }

          return addPage({
            ...part,
            ...pageBookData
          })
        })
      } else {
        return Promise.reject(new Error('File is not initialised'))
      }
    },
    saveImageFile(part) {
      if (this.file) {
        return uploadImage(this.file).then(result => {
          log('uploaded image:', result)
          log(`Creating page`)

          const pageImageData = {
            image: {
              filename: result.filename,
              ref: result.downloadUrl,
              created: Date.now()
            }
          }

          return addPage({
            ...part,
            ...pageImageData
          })
        })
      } else {
        return Promise.reject(new Error('File is not initialised'))
      }
    },
    saveRichText(content) {
      log('Saving Rich Text', content)
      if (content && this.savedPart) {
        return uploadJson(content)
          .then(result => {
            log('uploaded rich text:', result)
            log(`Creating page`)

            const pageRichTextData = {
              richText: {
                filename: result.filename,
                ref: result.downloadUrl,
                created: Date.now()
              }
            }

            return addPage({
              ...this.savedPart,
              ...pageRichTextData
            })
          })
          .then(page => {
            log('Page created:', page)
            this.addPageToList(this.enhancePage(page))
            this.$toast.success('Story was saved successfully')
          })
          .catch(error => {
            log(
              'There was an error uploading rich text for collaboration',
              error
            )
            this.$toast.error(error.message)
          })
      } else {
        return Promise.reject(new Error('There is no content to save'))
      }
    },
    previewRichTextContent() {
      log('In preview Rich Text')
      this.isRichTextPreview = !this.isRichTextPreview
      EventBus.$emit('rich-text-preview', {
        origin: this.origin,
        isPreview: this.isRichTextPreview
      })
    },
    contributionImageFilename() {
      if (this.contribution.image && this.contribution.image.filename) {
        return this.contribution.image.filename
      } else {
        return ''
      }
    },
    addPageToList(page) {
      this.pageContributionSaveDialog = false
      this.$emit('add', page)
    },
    deleteMedia() {
      log('in delete page:', this.contribution.id)

      deletePage(this.contribution.id)
        .then(() => {
          this.pageContributionDeleteDialog = false
          this.deletePageFromList(this.contribution.id)
        })
        .catch(error => {
          log('Error deleting page:', error)
          this.$toast.success('Error deleting page')
        })
    },
    deletePageFromList(pageOid) {
      this.pageContributionSaveDialog = false
      this.$emit('delete', pageOid)
    },
    enhancePage(page) {
      page.userDisplayName = this.user.data.displayName
      return page
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
<style>
</style>
