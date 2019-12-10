<template>
  <base-medium-viewer
    :dialog="dialog"
    :read-only="readOnly"
    :title="story.title"
    :theme="'secondary'"
    :user="user"
    :initial-medium="allSelectedMedium ? selectedMedium : activeMedium"
    :is-quote-enabled="isQuoteEnabled"
    :is-book-enabled="isBookEnabled"
    :is-image-enabled="isImageEnabled"
    :is-rich-text-enabled="isRichTextEnabled"
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
      <v-btn
        v-if="!readOnly && isMediaRichType(slotProps.activeMedium)"
        text
        class="toolbar-custom-btn"
        @click="previewRichTextContent"
      >
        <v-icon float-left>
          {{ isRichTextPreview ? 'mdi-pencil-outline' : 'mdi-note-text' }}
        </v-icon>
        <span class="hidden-sm-and-down">{{ isRichTextPreview ? 'Editor' : 'Preview' }}</span>
      </v-btn>
      <v-btn
        v-if="canDelete"
        text
        @click="pageContributionDeleteDialog = true"
      >
        <v-icon>
          mdi-delete
        </v-icon>
        <span class="pl-2 hidden-sm-and-down">Delete</span>
      </v-btn>
    </template>

    <template #content-container="slotProps">
      <medium-viewer-quote
        v-show="isMediaQuoteType(slotProps.activeMedium)"
        v-model="quote"
        :origin="origin"
        :theme="'secondary'"
      />

      <medium-viewer-image
        v-show="isMediaImageType(slotProps.activeMedium)"
        :src="imageSrc"
        :origin="origin"
        @image-updated="imageUpdated"
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

      <page-contribution-publish
        :key="publishKey"
        :dialog="publishDialog"
        :contribution="contribution"
        :quote="quote"
        :image-src="imageSrc"
        :uid="user.uid"
        :user-display-name="user.data.displayName ? user.data.displayName : 'Anon'"
        @close="publishDialog = false"
        @publish="onPublishComplete"
      />
      <!--      <page-contribution-save-dialog-->
      <!--        :dialog="publishDialog"-->
      <!--        @save="saveMedia"-->
      <!--        @close="publishDialog = false"-->
      <!--      />-->

      <page-contribution-delete-dialog
        :dialog="pageContributionDeleteDialog"
        @delete="deleteMedia"
        @close="pageContributionDeleteDialog = false"
      />
    </template>
  </base-medium-viewer>
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
import MediumViewerQuote from '~/components/MediumViewerQuote'
import MediumViewerRichText from '~/components/MediumViewerRichText'
import PageContributionPublish from '~/components/PageContributionPublish'
import PageContributionDeleteDialog from '~/components/PageContributionDeleteDialog'
import { uploadImage } from '~/api/service/image'
import { uploadBook } from '~/api/service/book'
import { uploadJson } from '~/api/service/rich-text'
import {
  addPage,
  deletePage
} from '~/api/service/page'

const log = debug('app:components/PageContributionMediumViewer')

export default {
  name: 'PageMediumViewer',
  components: {
    BaseMediumViewer,
    MediumViewerBook,
    MediumViewerImage,
    MediumViewerQuote,
    MediumViewerRichText,
    PageContributionPublish,
    PageContributionDeleteDialog
  },
  mixins: [MediumViewerMixin],
  props: {
    activeMedium: {
      type: Number,
      default: 3
    },
    selectedMedium: {
      type: Number,
      default: undefined
    },
    pagesRef: {
      type: Object,
      required: true
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
      publishDialog: false,
      pageContributionDeleteDialog: false,
      savedPart: null,
      publishKey: 0,
      quote: {
        src: '',
        background: '',
        color: ''
      }
    }
  },
  computed: {
    ...mapGetters('story', ['story']),
    allSelectedMedium: function() {
      return this.selectedMedium === undefined
    },
    isQuoteEnabled: function() {
      return (
        this.allSelectedMedium || this.isMediaQuoteType(this.selectedMedium)
      )
    },
    isBookEnabled: function() {
      return this.allSelectedMedium || this.isMediaBookType(this.selectedMedium)
    },
    isImageEnabled: function() {
      return (
        this.allSelectedMedium || this.isMediaImageType(this.selectedMedium)
      )
    },
    isRichTextEnabled: function() {
      return this.allSelectedMedium || this.isMediaRichType(this.selectedMedium)
    },
    // quoteSrc: function() {
    //   if (this.contribution.quote && this.contribution.quote.src) {
    //     return this.contribution.quote.src
    //   }
    //   return ''
    // },
    imageSrc: {
      get() {
        log('in imageSrc.get', this.contribution.image)
        if (this.contribution.image && this.contribution.image.ref) {
          return this.contribution.image.ref
        }
        return ''
      },
      set(val) {
        log('in previewImageSrc set', val)

        if (val) {
          this.contribution.image.ref = val
        }
      }
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
  mounted: function() {
    this.$nextTick(() => {
      document.documentElement.classList.add('overflow-y-hidden')
    })
  },
  methods: {
    onUploadPreview(file) {
      log('in onUploadPreview', this.pagesRef.id)
      this.file = file
      EventBus.$emit(`upload-preview-updated-${this.origin}`, {
        file: file
      })
    },
    saveMediaDialog(activeMedium) {
      log('saveMediaDialog:', activeMedium)
      this.mediaToSave = activeMedium
      this.publishDialog = true
    },
    onPublishComplete(basePagePublishModel) {
      log('in onPublishComplete', basePagePublishModel)
      this.saveMedia(basePagePublishModel)
    },
    saveMedia(basePagePublishModel) {
      log('in save media', this.mediaToSave, basePagePublishModel)

      if (basePagePublishModel && basePagePublishModel.summary) {
        // only need to save page, Create-page function will create the preview record in the background
        let keywords = []
        let authorTags = []
        keywords = stringUtils.findKeywords(basePagePublishModel.summary)
        authorTags = stringUtils.findAuthorTags(basePagePublishModel.summary)

        const pageCollaborationPart = {
          invite: false,
          public: true,
          chapterOid: this.contribution.chapterOid,
          storyOid: this.contribution.storyOid,
          richText: {},
          parentPagesOid: this.contribution.parentPagesOid,
          // parentPagesRef: this.contribution.parentPagesRef,
          summary: basePagePublishModel.summary,
          keywords: keywords.map(keyword => keyword.toLowerCase()),
          authorTags: authorTags,
          uid: this.user.uid,
          quote: this.quote.src ? this.quote : null,
          background: {
            color:
              basePagePublishModel.background.type === 'color'
                ? basePagePublishModel.background.val
                : '#000000',
            font: {
              color:
                basePagePublishModel.background.type === 'color'
                  ? basePagePublishModel.background.fontColor
                  : '#FFFFFF'
            },
          },
          wallpaperUrl: basePagePublishModel.background.val
        }

        if (this.isMediaBookType(this.mediaToSave)) {
          this.saveBookFile(pageCollaborationPart)
            .then(page => {
              log('Page created:', page)
              this.addPageToList(this.enhancePage(page))
              this.$toast.success('Book submitted')
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
              this.$toast.success('Image submitted')
            })
            .catch(error => {
              log('Error saving image', error)
              this.$toast.error('Error saving image')
            })
        } else if (this.isMediaRichType(this.mediaToSave)) {
          this.savedPart = pageCollaborationPart
          EventBus.$emit('rich-text-save')
        } else if (this.isMediaQuoteType(this.mediaToSave)) {
          log('adding quote:', this.quote)
          this.saveQuote(pageCollaborationPart)
            .then(page => {
              log('Page created:', page)
              this.addPageToList(this.enhancePage(page))
              this.$toast.success('Quote submitted')
            })
            .catch(error => {
              log('Error saving image', error)
              this.$toast.error('Error saving image')
            })
        }
      } else {
        this.$toast.error(
          'Please enter a short summary of your page you are going to publish'
        )
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
    saveQuote(part) {
      if (this.quote) {
        const pageQuoteData = {
          quote: this.quote
        }

        return addPage({
          ...part,
          ...pageQuoteData
        })
      } else {
        return Promise.reject(new Error('Quote is not initialised'))
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
      EventBus.$emit(`rich-text-preview-${this.origin}`, {
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
      this.publishDialog = false
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
      this.publishDialog = false
      this.$emit('delete', pageOid)
    },
    enhancePage(page) {
      page.userDisplayName = this.user.data.displayName
      return page
    },
    imageUpdated(src) {
      log('Image upload updated:', src)
      this.imageSrc = src
      this.rePublishDialog()
    },
    rePublishDialog() {
      // force rerender
      this.publishKey += 1
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
<style>
</style>
