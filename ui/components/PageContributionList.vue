<template>
  <v-layout row wrap justify-center>
    <v-flex xs12>
      <v-toolbar color="secondary" dark>
        <v-toolbar-side-icon>
          <v-icon
            large
            left
            class="toolbar-icon"
          >
            group
          </v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title>Collaborations</v-toolbar-title>
        <v-spacer />
        <v-tooltip top>
          <template #activator="{ on }">
            <v-btn
              icon
              v-on="on"
              @click="openMediumViewerNewPage()"
            >
              <v-icon>
                add_circle_outline
              </v-icon>
            </v-btn>
          </template>
          <span>Submit Content</span>
        </v-tooltip>
      </v-toolbar>

      <v-card>
        <v-container
          fluid
          grid-list-md
        >
          <v-layout
            row
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
              />
            </v-flex>
            <v-flex v-if="!collaborations || collaborations.length === 0">
              There aren't any collaborations yet, why not add one?
              <v-btn
                icon
                color="secondary"
                @click="openMediumViewerNewPage()"
              >
                <v-icon>
                  add_circle_outline
                </v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <page-contribution-medium-viewer
      :activeMedium=activeMedium
      :key="viewerKey"
      :dialog="pageMediumDialog"
      :contribution="selectedChildPage"
      :pages-ref="pagesRef"
      :origin:="origin"
      :read-only="readOnly"
      :user="user"
      @add="addContribution"
      @delete="deleteContribution"
      @close="pageMediumDialog = false"
    />
  </v-layout>
</template>

<script>
import { IMAGE_TYPE, RICH_TEXT_TYPE } from '~/utils/file'
import debug from 'debug'
import MediumViewerMixin from '../mixins/MediumViewerMixin'
import { findPagesByParent, getPagesRef } from '~/api/service/page'
import { findUserByOid } from '~/api/service/user'
import PageContributionCard from '~/components/PageContributionCard'
import PageContributionMediumViewer from '~/components/PageContributionMediumViewer'

const log = debug('app:components/PageContributionList')

export default {
  name: 'PageContributionList',
  components: {
    PageContributionCard,
    PageContributionMediumViewer
  },
  mixins: [MediumViewerMixin],
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
        userDisplayName: null
      },
      pageMediumDialog: this.initialDialogState,
      readOnly: true,
      viewerKey: 0
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
      log('fetching collaborations')
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
      } else {
        this.pageMediumDialog = false
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
    },
    openMediumViewerNewPage() {
      log(
        'openMediumViewerNewPage.........................',
        this.user.uid,
        this.user.data.displayName,
        this.user
      )
      this.readOnly = false
      this.activeMedium = 3
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
      log('Open medium viewer for page', page.id, this.origin)
      this.readOnly = true
      this.selectedChildPage = page

      this.reRenderMediumViewer()

      this.activeMedium = this.getActiveMedium(page)

      this.pageMediumDialog = true
    },
    getActiveMedium(page) {
      if (page.image && page.image.ref) {
        return this.mediaImageType
      }

      if (page.book && page.book.ref && page.book.contentType) {
        return this.mediaBookType
      }

      if (page.richText && page.richText.ref) {
        return this.mediaRichTextType
      }
      log("Couldn't find active medium for page")
      return 3
    },
    getPageMediumType(page) {
      log('page:', page.book.contentType)
      if (page.image && page.image.ref) {
        return IMAGE_TYPE
      }

      if (page.book && page.book.ref && page.book.contentType) {
        return page.book.contentType
      }

      if (page.richText && page.richText.ref) {
        return RICH_TEXT_TYPE
      }
      return undefined
    },
    getPageMediumSrc(page) {
      if (page.image && page.image.ref) {
        return page.image.ref
      }

      if (page.book && page.book.ref) {
        return page.book.ref
      }

      if (page.richText && page.richText.ref) {
        return page.richText.ref
      }
      return undefined
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
    }
  }
}
</script>

<style>
.toolbar-icon {
  padding-left: 10px;
}
</style>
