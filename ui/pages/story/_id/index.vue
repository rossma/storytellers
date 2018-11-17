<template>
  <v-container grid-list-xl>
    <v-layout
      v-if="user.uid && story.id"
      row
      wrap>
      <v-flex xs12>
        <story-detail
          :author="authorUser"
          :story="story"
          :editable="isEditable"
          :story-exists="true"/>
      </v-flex>
      <v-flex xs12>
        <story-tabs
          :page="page"
          :editable="isEditable"
          :has-story-cover="story.cover" />
        <story-action-controls
          :page="page"
          :editable="isEditable"
          :total-story-pages="totalStoryPages"
          :user="user" />
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
import { findStoryByOid } from '~/api/service/story'
import { findChapterByOid } from '~/api/service/chapter'
import clonedepp from 'lodash.clonedeep'
import StoryActionControls from '~/components/StoryActionControls.vue'
import StoryDetail from '~/components/StoryDetail.vue'
import StoryTabs from '~/components/StoryTabs.vue'
import UserStateMixin from '~/mixins/UserStateMixin'

export default {
  mixins: [ UserStateMixin ],
  components: {
    StoryActionControls,
    StoryDetail,
    StoryTabs
  },
  layout: 'story',
  data () {
    return {
      authorUser: '',
      chapter: {
        id: null,
        number: null
      },
      page: {
        id: null,
        image: {
          filename: null,
          ref: null
        },
        book: {
          filename: null,
          ref: null
        },
        number: null
      },
      mutablePages: [],
      story: {
        id: null,
        title: null,
        summary: null,
        ext: {}
      }
    }
  },
  computed: {
    ...mapGetters('modules/page', [
      'pages'
    ]),
    isEditable: function () {
      return this.page.uid === this.user.uid
    },
    totalStoryPages: function () {
      if (this.pages) {
        return this.pages.length
      } else {
        return 0
      }
    }
  },
  watch: {
    user: function (val) {
      console.log('user watch triggered', val)
      this.loadPage(this.$route.params.id)
    }
  },
  created: function () {
    this.mutablePages = this.pages.slice() // clone pages
  },
  mounted: function () {
    this.$nextTick(() => {
      console.log('[Story Detail] - in mounted, page id:', this.$route.params.id)
      this.loadPage(this.$route.params.id)

      EventBus.$on('storyImageFileKey', imageDetails => {
        console.log(`[Story Detail] - storyImageFileKey event received:`, imageDetails)
        this.page.image = {
          filename: imageDetails.filenameKey,
          ref: imageDetails.imageSrc
        }
      })

      EventBus.$on('storyBookFileKey', bookDetails => {
        console.log(`[Story Detail] - storyBookFileKey event received:`, bookDetails)
        this.page.book = {
          filename: bookDetails.filenameKey,
          ref: bookDetails.bookSrc
        }
      })

      EventBus.$on('deletePage', page => {
        console.log(`[Story Detail] - deletePage event received:`, page)
        this.deletePage(page)
      })

      EventBus.$on('savePages', pages => {
        console.log(`[Story Detail] - savePages event received:`, pages)
        this.mutablePages = this.pages.slice()
      })
    })
  },
  beforeDestroy () {
    EventBus.$off('storyImageFileKey')
    EventBus.$off('storyBookFileKey')
    EventBus.$off('deletePage')
    EventBus.$off('savePages')
  },
  methods: {
    ...mapActions('modules/story', ['saveStory']),
    loadPage (pageOid) {
      if (this.user.uid) {
        findPageByOid(pageOid).then((pageDoc) => {
          if (pageDoc.exists) {
            this.page = {
              id: pageOid,
              chapterOid: pageDoc.data().chapterOid,
              page: pageDoc.data().page,
              public: pageDoc.data().public,
              storyOid: pageDoc.data().storyOid,
              uid: pageDoc.data().uid,
              image: {...pageDoc.data().image},
              book: {...pageDoc.data().book}
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
      }
    },
    initAuthorUser (userOid) {
      findUserByOid(userOid).then((userDoc) => {
        if (userDoc.exists) {
          this.authorUser = userDoc.data()
        } else {
          this.$toast.error('Author does not exist')
        }
      })
    },
    initStory (storyOid) {
      findStoryByOid(storyOid).then((storyDoc) => {
        if (storyDoc.exists) {
          this.story.id = storyDoc.id
          this.story.summary = storyDoc.data().summary
          this.story.title = storyDoc.data().title
          this.story.uid = storyDoc.data().uid
          this.story.ext.activePage = clonedepp(this.page)
          this.saveStory(this.story)
        } else {
          this.$toast.error('Story does not exist')
        }
      })
    },
    initChapter (chapterOid) {
      findChapterByOid(chapterOid).then((chapterDoc) => {
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
    isAuthorised () {
      return this.page.public || this.page.uid === this.user.uid
    },
    deletePage (page) {
      const runDelete = () => {
        console.log('in deletePage mutablePages:', this.mutablePages)

        const chapterPageCount = this.chapterPageCount(this.mutablePages, page.chapterOid)

        console.log('chapterPageCount:', chapterPageCount)

        if (chapterPageCount === 1) {
          console.log('deleting whole chapter')
          return deleteChapter(page.chapterOid)
        } else {
          console.log('deleting page')
          return deletePage(page.id)
        }
      }

      if (this.totalStoryPages > 1) {
        runDelete().then(() => {
          this.mutablePages = this.mutablePages.filter(p => p.id !== page.id)
          this.$router.push(`/story/${this.mutablePages[0].id}`)
        }).catch((error) => {
          console.log('There was an error deleting the current page', error)
          this.$toast.error(error.message)
        })
      } else {
        this.$toast.error(`Can't delete page if it is the only one that exists`)
      }
    },
    chapterPageCount (pages, chapterOid) {
      return pages.filter((page) => page.chapterOid === chapterOid).length
    }
  }
}
</script>
