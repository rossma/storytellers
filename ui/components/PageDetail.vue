<template>
  <div>
    <v-card
      v-if="!contentExists"
      flat
    >
      <v-toolbar
        color="indigo"
        dark
      >
        <v-toolbar-title>Content Creation</v-toolbar-title>
      </v-toolbar>
      <v-card-title>
        <v-layout wrap>
          <v-flex x4 mt-1 ml-4 text-center>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn
                  large
                  text
                  v-on="on"
                  @click.stop="openPageMediumDialog(4)"
                >
                  <v-icon large>
                    mdi-comment-quote-outline
                  </v-icon>
                </v-btn>
              </template>
              <span>Quote</span>
            </v-tooltip>
          </v-flex>
          <v-flex x4 mt-1 ml-4 text-center>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn
                  large
                  text
                  v-on="on"
                  @click.stop="openPageMediumDialog(1)"
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
                  @click.stop="openPageMediumDialog(2)"
                >
                  <v-icon large>
                    mdi-book-open-page-variant
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
                  @click.stop="openPageMediumDialog(3)"
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
            No content created for this page, start by uploading or creating one using the controls above
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
    <v-card
      v-else
      :key="pageDetailKey"
      flat
    >
      <v-card-title
        class="page-detail-title subtitle-2 mb-2"
      >
        {{ activeChapterName }}
        <v-spacer />
        Page {{ activeChapter.index }}.{{ activePageNumber }}
      </v-card-title>
      <v-card-text>
        <page-detail-quote
          v-if="pageQuoteSrc"
          :page="page"
          :src="pageQuoteSrc"
          :user="user"
        />
        <page-detail-rich-text
          v-if="pageRichTextSrc"
          :page="page"
          :src="pageRichTextSrc"
          :user="user"
        />
        <page-detail-book-pdf
          v-else-if="pageBookSrc && isPdf"
          :key="pageDetailKey"
          :page="page"
          :src="pageBookSrc"
          :user="user"
        />
        <page-detail-book-epub
          v-else-if="pageBookSrc && isEpub"
          :page="page"
          :src="pageBookSrc"
          :user="user"
        />
        <page-detail-image
          v-else-if="pageImageSrc"
          :page="page"
          :src="pageImageSrc"
          :user="user"
        />
      </v-card-text>
      <v-card-actions
        v-if="page.public"
        class="black"
      >
        <v-spacer />
        {{ likes }} likes
        <v-btn
          icon
          @click="like()"
        >
          <v-icon :color="liked ? 'red' : 'white' ">
            mdi-heart
          </v-icon>
        </v-btn>
        {{ comments }} comments
        <v-btn
          icon
          @click="commentsDialog = true"
        >
          <v-icon>mdi-comment-outline</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
    <page-contribution-list
      v-if="page.invite"
      :page="page"
      :initial-dialog-state="initialChildDialog"
      :user="user"
    />
    <portal to="medium-viewer-dialog">
      <page-medium-viewer
        :dialog="pageMediumDialog"
        :page="page"
        :selected-medium="selectedMedium"
        :story-cover="storyCover"
        :user="user"
        @close="closePageMediumDialog()"
      />
    </portal>
    <page-comments
      :comments="page.comments"
      :dialog="commentsDialog"
      :page-id="page.id"
      :uid="user.uid"
      :user-display-name="user.data.displayName ? user.data.displayName : 'Anon'"
      @increment="newComment"
      @close="commentsDialog = false"
    />
  </div>
</template>

<script>
import debug from 'debug'
import { mapGetters } from 'vuex'
import { updatePage } from '~/api/service/page'
import PageMixin from '~/mixins/PageMixin'
import PageMediumViewer from '~/components/PageMediumViewer'
import PageComments from '~/components/PageComments'
import PageContributionList from './PageContributionList'
import PageDetailQuote from './PageDetailQuote'
import PageDetailRichText from './PageDetailRichText'
import PageDetailBookEpub from './PageDetailBookEpub'
import PageDetailBookPdf from './PageDetailBookPdf'
import PageDetailImage from './PageDetailImage'
const log = debug('app:components/PageDetail')

export default {
  name: 'PageDetail',
  components: {
    PageContributionList,
    PageMediumViewer,
    PageComments,
    PageDetailQuote,
    PageDetailRichText,
    PageDetailBookEpub,
    PageDetailBookPdf,
    PageDetailImage
  },
  mixins: [PageMixin],
  props: {
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
      commentsDialog: false,
      pageMediumDialog: false,
      selectedMedium: 3,
      isCollaboration: false,
      selectedPageCollaboration: {
        image: null
      },
      pageDetailKey: 0,
      initialChildDialog: this.page.id !== this.page.selectedPageOid
    }
  },
  computed: {
    ...mapGetters('page', ['activePage']),
    ...mapGetters('chapter', ['activeChapter']),
    contentExists: function() {
      return (
        this.pageQuoteSrc ||
        this.pageRichTextSrc ||
        this.pageBookSrc ||
        this.pageImageSrc
      )
    },
    pageRichTextSrc: function() {
      return this.getPageRichTextSrc(this.page)
    },
    pageBookSrc: function() {
      return this.getPageBookSrc(this.page)
    },
    bookType: function() {
      return this.getBookType(this.page)
    },
    isEpub: function() {
      return this.getIsEpub(this.bookType)
    },
    isPdf: function() {
      return this.getIsPdf(this.bookType)
    },
    pageImageSrc: function() {
      return this.getPageImageSrc(this.page)
    },
    pageQuoteSrc: function() {
      if (this.page.quote && this.page.quote.src) {
        return this.page.quote.src
      } else {
        return undefined
      }
    },
    activePageNumber: function() {
      if (this.activePage && this.activePage.page) {
        return this.activePage.page.page
      } else {
        return undefined
      }
    },
    activeChapterName: function() {
      if (
        this.activeChapter &&
        this.activeChapter.chapter &&
        this.activeChapter.chapter.name
      ) {
        return this.activeChapter.chapter.name
      } else if (this.activeChapter) {
        return `Chapter ${this.activeChapter.index}`
      } else {
        return ''
      }
    },
    liked: {
      get() {
        log('in liked get', this.page.likes)
        if (this.page.likes) {
          return this.page.likes.includes(this.user.uid)
        } else {
          return false
        }
      },
      set(val) {
        log('in liked set')
        if (!this.page.likes) {
          this.page.likes = []
        }

        if (val) {
          if (!this.page.likes.includes(this.user.uid)) {
            this.page.likes.push(this.user.uid)
          }
        } else {
          this.page.likes = this.page.likes.filter(el => el !== this.user.uid)
        }
      }
    },
    comments: function() {
      if (this.page.comments) {
        return this.page.comments.length
      } else {
        return 0
      }
    },
    likes: function() {
      if (this.page.likes) {
        return this.page.likes.length
      } else {
        return 0
      }
    }
  },
  methods: {
    closePageMediumDialog() {
      this.pageDetailKey += 1
      this.pageMediumDialog = false
    },
    like() {
      this.liked = !this.liked
      log('updating page', this.page.id, this.page.likes)
      updatePage(this.page.id, { likes: this.page.likes })
    },
    newComment(comment) {
      if (this.page.comments) {
        this.page.comments.push(comment)
      } else {
        this.page.comments = [comment]
      }
    },
    // onQuoteSaved(quote) {
    //   log('in quote saved', quote)
    //   EventBus.$emit('story-page-quote-save', quote)
    //   this.pageDetailKey += 1
    // },
    openPageMediumDialog(mediumType) {
      this.selectedMedium = mediumType
      this.pageMediumDialog = true
    }
  }
}
</script>

<style scoped>
/*.v-image {*/
/*  cursor: pointer;*/
/*  max-height: 500px;*/
/*}*/
.page-detail-title {
}
</style>
