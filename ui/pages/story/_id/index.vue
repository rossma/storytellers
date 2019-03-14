<template>
  <v-container grid-list-xl>
    <v-layout
      v-if="user.uid && story.id"
      row
      wrap
    >
      <v-flex xs12>
        <story-detail
          :author="authorUser"
          :story="story"
          :editable="isEditable"
          :story-exists="true"
        />
      </v-flex>
      <v-flex xs12>
        <page-detail
          :page="page"
          :editable="isEditable"
          :story-cover="story.cover"
          :user="user"
        />
        <story-action-controls
          :page="page"
          :editable="isEditable"
          :total-story-pages="totalStoryPages"
          :user="user"
          @delete-page="deletePage"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import { deleteChapter } from '~/api/service/chapter'
import { deletePage } from '~/api/service/page'
import { findPageByOid } from '~/api/service/page'
import { findUserByOid } from '~/api/service/user'
import { deleteCover, findStoryByOid } from '~/api/service/story'
import { findChapterByOid } from '~/api/service/chapter'
import clonedeep from 'lodash.clonedeep'
import PageDetail from '~/components/PageDetail'
import StoryActionControls from '~/components/StoryActionControls.vue'
import StoryDetail from '~/components/StoryDetail.vue'
import UserStateMixin from '~/mixins/UserStateMixin'
import debug from 'debug'
const log = debug('app:pages/story/_id/index')

export default {
  components: {
    PageDetail,
    StoryActionControls,
    StoryDetail
  },
  mixins: [UserStateMixin],
  layout: 'story',
  data() {
    return {
      authorUser: '',
      chapter: {
        id: null,
        number: null
      },
      page: {
        id: null,
        book: {
          filename: null,
          ref: null
        },
        comments: [],
        image: {
          filename: null,
          ref: null
        },
        likes: [],
        number: null
      },
      mutablePages: [],
      story: {
        id: null,
        title: null,
        summary: null,
        cover: {}
        // ,
        // ext: {}
      }
    }
  },
  computed: {
    ...mapGetters('page', ['pages']),
    isEditable: function() {
      return this.page.uid === this.user.uid
    },
    totalStoryPages: function() {
      if (this.pages) {
        return this.pages.length
      } else {
        return 0
      }
    }
  },
  watch: {
    user: function(val) {
      log('user watch triggered', val)
      this.loadPage(this.$route.params.id)
    }
  },
  created: function() {
    this.mutablePages = this.pages.slice() // clone pages
  },
  mounted: function() {
    this.$nextTick(() => {
      log('in mounted, page id:', this.$route.params.id)
      this.loadPage(this.$route.params.id)

      EventBus.$on('story-image-file-key', imageDetails => {
        log(`storyImageFileKey event received:`, imageDetails)
        this.page.image = {
          filename: imageDetails.filenameKey,
          ref: imageDetails.imageSrc
        }
      })

      EventBus.$on('story-book-file-key', bookDetails => {
        log(`story-book-file-key event received:`, bookDetails)
        this.page.book = {
          filename: bookDetails.filenameKey,
          ref: bookDetails.bookSrc
        }
      })

      EventBus.$on('save-pages', pages => {
        log(`savePages event received:`, pages)
        this.mutablePages = this.pages.slice()
      })
    })
  },
  beforeDestroy() {
    EventBus.$off('story-image-file-key2')
    EventBus.$off('story-image-file-key')
    EventBus.$off('story-book-file-key')
    EventBus.$off('save-pages')
  },
  methods: {
    ...mapActions('story', ['saveStory']),
    loadPage(pageOid) {
      if (this.user.uid) {
        findPageByOid(pageOid)
          .then(pageDoc => {
            if (pageDoc.exists) {
              this.page = {
                id: pageOid,
                book: { ...pageDoc.data().book },
                chapterOid: pageDoc.data().chapterOid,
                comments: pageDoc.data().comments
                  ? clonedeep(pageDoc.data().comments)
                  : [],
                image: { ...pageDoc.data().image },
                likes: pageDoc.data().likes,
                page: pageDoc.data().page,
                public: pageDoc.data().public,
                storyOid: pageDoc.data().storyOid,
                uid: pageDoc.data().uid
              }

              if (this.isAuthorised()) {
                this.initAuthorUser(this.page.uid)
                this.initStory(this.page.storyOid)
                this.initChapter(this.page.chapterOid)
              } else {
                this.$toast.error('User not authorised to view this page')
              }
            } else {
              this.$toast.error('Page does not exist')
            }
          })
          .catch(error => log('err', error))
      }
    },
    initAuthorUser(userOid) {
      findUserByOid(userOid).then(userDoc => {
        if (userDoc.exists) {
          this.authorUser = userDoc.data()
        } else {
          this.$toast.error('Author does not exist')
        }
      })
    },
    initStory(storyOid) {
      findStoryByOid(storyOid).then(storyDoc => {
        if (storyDoc.exists) {
          this.story.id = storyDoc.id
          this.story.summary = storyDoc.data().summary
          this.story.title = storyDoc.data().title
          this.story.uid = storyDoc.data().uid
          this.story.cover = { ...storyDoc.data().cover }
          this.story.activePage = clonedeep(this.page)

          log('saving story with updated active page')
          this.saveStory(clonedeep(this.story))
        } else {
          this.$toast.error('Story does not exist')
        }
      })
    },
    initChapter(chapterOid) {
      findChapterByOid(chapterOid).then(chapterDoc => {
        if (chapterDoc.exists) {
          this.chapter.id = chapterDoc.id
          this.chapter.chapter = chapterDoc.data().chapter
          this.chapter.name = chapterDoc.data().name
          this.chapter.storyOid = chapterDoc.data().storyOid
          this.chapter.uid = chapterDoc.data().uid
        } else {
          this.$toast.error('Chapter does not exist')
        }
      })
    },
    isAuthorised() {
      return this.page.public || this.page.uid === this.user.uid
    },
    deletePage(page) {
      const deleteStoryCover = () => {
        if (this.story.cover && this.story.cover.pageOid === page.id) {
          log('in deleteCover for story:', this.story.id)
          return deleteCover(this.storyOid)
        } else {
          log('page being deleted is not story cover')
          return Promise.resolve()
        }
      }

      const runDelete = () => {
        log('in deletePage mutablePages:', this.mutablePages)

        const chapterPageCount = this.chapterPageCount(
          this.mutablePages,
          page.chapterOid
        )

        log('chapterPageCount:', chapterPageCount)

        if (chapterPageCount === 1) {
          log('deleting whole chapter')
          return deleteChapter(page.chapterOid)
        } else {
          log('deleting page')
          return deletePage(page.id)
        }
      }

      if (this.totalStoryPages > 1) {
        deleteStoryCover()
          .then(() => {
            log('cover removed from page')
            return runDelete()
          })
          .then(() => {
            this.mutablePages = this.mutablePages.filter(p => p.id !== page.id)
            this.$router.push(`/story/${this.mutablePages[0].id}`)
          })
          .catch(error => {
            log('There was an error deleting the current page', error)
            this.$toast.error(error.message)
          })
      } else {
        this.$toast.error(`Can't delete page if it is the only one that exists`)
      }
    },
    chapterPageCount(pages, chapterOid) {
      return pages.filter(page => page.chapterOid === chapterOid).length
    }
  }
}
</script>
