<template>
  <v-layout wrap justify-center>
    <v-flex xs12>
      <v-toolbar color="secondary">
        <v-icon
          large
          float-left
          class="btn-look"
        >
          mdi-account-group
        </v-icon>
        <v-toolbar-title>Collaborations</v-toolbar-title>
        <v-spacer />
        <v-tooltip top>
          <template #activator="{ on }">
            <v-btn
              icon
              v-on="on"
              @click="openMediumViewerNewPage(3)"
            >
              <v-icon>
                mdi-plus-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>Submit Content</span>
        </v-tooltip>
      </v-toolbar>

      <v-card v-if="Object.entries(collaborations).length === 0 && collaborations.constructor === Object" flat>
        <v-card-title>
          <v-layout wrap>
            <v-flex x4 mt-1 ml-4 text-center>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn
                    large
                    text
                    v-on="on"
                    @click.stop="openMediumViewerNewPage(1)"
                  >
                    <v-icon large>
                      mdi-card-text-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>Rich Text</span>
              </v-tooltip>
            </v-flex>
            <v-flex x4 mt-1 ml-4 text-center>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn
                    large
                    text
                    v-on="on"
                    @click.stop="openMediumViewerNewPage(2)"
                  >
                    <v-icon large>
                      mdi-book-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>Words</span>
              </v-tooltip>
            </v-flex>
            <v-flex x4 mt-1 ml-4 text-center>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn
                    large
                    text
                    v-on="on"
                    @click.stop="openMediumViewerNewPage(3)"
                  >
                    <v-icon large>
                      mdi-brush
                    </v-icon>
                  </v-btn>
                </template>
                <span>Pictures</span>
              </v-tooltip>
            </v-flex>
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-layout wrap>
            <v-flex x12 mt-1 ml-4 text-center>
              No collaborations created for this page, be the first by uploading or creating one using the controls above
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
      <v-card v-else flat>
        <v-container
          fluid
          grid-list-md
        >
          <v-layout
            wrap
          >
            <v-flex
              v-for="collaboration in collaborations"
              :key="collaboration.id"
              class="pa-2"
              d-flex
              xs12
              sm6
              md3
            >
              <page-contribution-card
                :child-page="collaboration"
                :user="user"
                @open-viewer="openMediumViewerForPage"
                @open-comments="openCommentsDialog"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <portal to="contribution-medium-viewer-dialog">
      <page-contribution-medium-viewer
        v-if="pageMediumDialog && user.uid === selectedChildPage.uid"
        :key="viewerKey"
        :active-medium="activeMedium"
        :selected-medium="selectedMedium"
        :dialog="pageMediumDialog"
        :contribution="selectedChildPage"
        :pages-ref="pagesRef"
        :origin:="origin"
        :read-only="readOnly"
        :user="user"
        @add="addContribution"
        @delete="deleteContribution"
        @close="closeMediumDialog"
      />
    </portal>

    <page-comments
      v-if="selectedChildPage.id"
      :key="dialogKey"
      :comments="selectedChildPage.comments"
      :dialog="commentsDialog"
      :page-id="selectedChildPage.id"
      :theme="'secondary'"
      :uid="user.uid"
      :user-display-name="user.data.displayName ? user.data.displayName : 'Anon'"
      @increment="newComment"
      @close="commentsDialog = false"
    />

    <v-card
      :key="pageDetailDialogKey"
      flat
    >
      <v-card-text>
        <page-detail-rich-text
          v-if="pageDetailRichTextDialog && user.uid !== selectedChildPage.uid"
          :dialog="pageDetailRichTextDialog"
          :page="selectedChildPage"
          :src="selectedChildPageSrc"
          :theme="'secondary'"
          :user="user"
          :show-thumbnail="false"
        />
        <page-detail-book-pdf
          v-if="pageDetailBookPdfDialog && user.uid !== selectedChildPage.uid"
          :dialog="pageDetailBookPdfDialog"
          :page="selectedChildPage  "
          :src="selectedChildPageSrc"
          :theme="'secondary'"
          :user="user"
          :show-thumbnail="false"
        />
        <page-detail-book-epub
          v-if="pageDetailBookEpubDialog && user.uid !== selectedChildPage.uid"
          :dialog="pageDetailBookEpubDialog"
          :page="selectedChildPage"
          :src="selectedChildPageSrc"
          :theme="'secondary'"
          :user="user"
          :show-thumbnail="false"
        />
        <page-detail-image
          v-if="pageDetailImageDialog && user.uid !== selectedChildPage.uid"
          :dialog="pageDetailImageDialog"
          :page="selectedChildPage"
          :src="selectedChildPageSrc"
          :theme="'secondary'"
          :user="user"
          :show-thumbnail="false"
        />
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script>
import debug from 'debug'
// import { EventBus } from '~/utils/event-bus.js'
import MediumViewerMixin from '~/mixins/MediumViewerMixin'
import PageMixin from '~/mixins/PageMixin'
import { findPagesByParent, getPagesRef } from '~/api/service/page'
import { findUserByOid } from '~/api/service/user'
import PageContributionCard from '~/components/PageContributionCard'
import PageContributionMediumViewer from '~/components/PageContributionMediumViewer'
import PageComments from '~/components/PageComments'
  import PageDetailRichText from './PageDetailRichText'
import PageDetailBookEpub from './PageDetailBookEpub'
import PageDetailBookPdf from './PageDetailBookPdf'
import PageDetailImage from './PageDetailImage'

const log = debug('app:components/PageContributionList')

export default {
  name: 'PageContributionList',
  components: {
    PageContributionCard,
    PageContributionMediumViewer,
    PageComments,
    PageDetailRichText,
    PageDetailBookEpub,
    PageDetailBookPdf,
    PageDetailImage,
  },
  mixins: [MediumViewerMixin, PageMixin],
  props: {
    page: {
      type: Object,
      required: true
    },
    user: {
      type: Object,
      required: true
    },
    initialDialogState: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeMedium: 3,
      selectedMedium: null,
      collaborations: {},
      childUserDetails: {},
      origin: 'contribution',
      selectedChildPage: {
        id: null,
        uid: null,
        book: {
          filename: null
        },
        image: {
          filename: null
        },
        richText: {},
        summary: null,
        userDisplayName: null,
        comments: null
      },
      selectedChildPageSrc: '',
      pageMediumDialog: this.initialDialogState,
      pageDetailRichTextDialog: false,
      pageDetailBookEpubDialog: false,
      pageDetailBookPdfDialog: false,
      pageDetailImageDialog: false,
      readOnly: true,
      dialogKey: 0,
      viewerKey: 0,
      pageDetailDialogKey: 0,
      commentsDialog: false
    }
  },
  computed: {
    pagesRef: function() {
      return getPagesRef(this.page.id)
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    init() {
      this.fetchCollaborations().then(() => this.loadSelectedChildPage())
    },
    fetchCollaborations() {
      return findPagesByParent(this.pagesRef).then(pages => {
        pages.forEach(page => {
          this.$set(this.collaborations, page.id, page)
          this.getUserDetails(page.uid).then(userDetails => {
            this.$set(
              this.collaborations[page.id],
              'userDisplayName',
              userDetails.displayName
            )
          })
        })
      })
    },
    loadSelectedChildPage() {
      log('in load selected child page', this.collaborations)
      if (this.isPageInitFromChild()) {
        log('child page selected')

        this.openMediumViewerForPage(
          this.collaborations[this.page.selectedPageOid]
        )
      }
    },
    isPageInitFromChild() {
      return (
        this.page.id !== this.page.selectedPageOid &&
        this.page.selectedPageOid in this.collaborations
      )
    },
    async getUserDetails(userKey) {
      // look in client cache for user key if not found then query DB
      if (this.childUserDetails[userKey]) {
        return this.childUserDetails[userKey]
      } else {
        const userDoc = await findUserByOid(userKey)
        log('found user:', userDoc.data())
        this.childUserDetails[userKey] = userDoc.data()
        return userDoc.data()
      }
    },
    reRenderMediumViewer() {
      // force rerender
      this.viewerKey += 1

      // have to set the root el to have overflow hidden to hide vertical scrollbar on modal open
      document.documentElement.classList.add('overflow-y-hidden')
    },
    reRenderPageDetailDialog() {
      // force rerender
      this.pageDetailDialogKey += 1
    },
    closeMediumDialog() {
      document.documentElement.classList.remove('overflow-y-hidden')
      this.pageMediumDialog = false
    },
    reRenderCommentsDialog() {
      // force rerender
      this.dialogKey += 1
    },
    openMediumViewerNewPage(mediumType) {
      this.selectedMedium = mediumType
      this.activeMedium = mediumType
      this.readOnly = false
      this.pageMediumDialog = true
      this.selectedChildPage = {
        id: null,
        chapterOid: this.page.chapterOid,
        invite: false,
        public: true,
        storyOid: this.page.storyOid,
        book: {
          filename: null,
          ref: null
        },
        image: {
          filename: null,
          ref: null
        },
        richText: {},
        parentPagesOid: this.page.id,
        // parentPagesRef: null, // todo?
        summary: null,
        uid: this.user.uid,
        userDisplayName: this.user.displayName,
        wallpaperUrl: this.page.wallpaperUrl
      }

      this.reRenderMediumViewer()
    },
    openMediumViewerForPage(page) {
      log('Open medium viewer for page', page.id)

      this.pageMediumDialog = false
      this.pageDetailRichTextDialog = false
      this.pageDetailBookEpubDialog = false
      this.pageDetailBookPdfDialog = false
      this.pageDetailImageDialog = false

      this.readOnly = true
      this.selectedChildPage = page

      this.reRenderMediumViewer()
      this.reRenderPageDetailDialog()

      this.activeMedium = this.getActiveMedium(page)
      this.selectedMedium = this.activeMedium

      if (page.id && this.user.uid === page.uid) {
        // open editable medium dialog
        this.pageMediumDialog = true
      } else {
        if (this.getPageRichTextSrc(page)) {
          log('a')
          this.selectedChildPageSrc = this.getPageRichTextSrc(page)
          this.pageDetailRichTextDialog = true
          // EventBus.$emit('open-page-detail-rich-text-dialog')
        } else if (this.getPageBookSrc(page)) {
          log('b')
          this.selectedChildPageSrc = this.getPageBookSrc(page)
          if (this.getIsEpub(this.getBookType(page))) {
            log('c')
            this.pageDetailBookEpubDialog = true
            // EventBus.$emit('open-page-detail-book-epub-dialog')
          } else if (this.getIsPdf(this.getBookType(page))) {
            log('d')
            this.pageDetailBookPdfDialog = true
            // EventBus.$emit('open-page-detail-book-pdf-dialog')
          }
        } else if (this.getPageImageSrc(page)) {
          log('e')
          this.pageDetailImageDialog = true
          this.selectedChildPageSrc = this.getPageImageSrc(page)
          log('e', this.selectedChildPageSrc)
          // EventBus.$emit('open-page-detail-image-dialog')
        } else {
          log('end')
        }
      }
    },
    openCommentsDialog(page) {
      log('Open comments for page', page.id)
      this.reRenderCommentsDialog()
      this.selectedChildPage = page
      this.commentsDialog = true
    },
    getActiveMedium(page) {
      if (page.image && page.image.ref) {
        return this.mediaImageType
      } else if (page.book && page.book.ref && page.book.contentType) {
        return this.mediaBookType
      } else if (page.richText && page.richText.ref) {
        return this.mediaRichTextType
      }
      log("Couldn't find active medium for page")
      return 3
    },
    addContribution(page) {
      log('Adding page to contribution', page)
      this.$set(this.collaborations, page.id, page)
      this.pageMediumDialog = false
    },
    deleteContribution(pageOid) {
      log('Deleting page from contribution', pageOid)
      this.$delete(this.collaborations, pageOid)
      this.pageMediumDialog = false
    },
    newComment(comment) {
      if (this.selectedChildPage.comments) {
        log('new comment:', comment)
        this.selectedChildPage.comments.push(comment)
      } else {
        this.selectedChildPage.comments = [comment]
      }
    }
  }
}
</script>

<style>
</style>
