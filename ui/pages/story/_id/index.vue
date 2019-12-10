<template>
  <v-container grid-list-xl>
    <v-layout
      v-if="user.uid && story.id"
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
          :story-cover="story.cover"
          :user="user"
        />
        <story-action-controls
          :page="page"
          :editable="isEditable"
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
import { deleteChapter, findChapterByOid } from '~/api/service/chapter'
import { addPage, deletePage, findPageByOid } from '~/api/service/page'
import { findUserByOid } from '~/api/service/user'
import { deleteCover, findStoryByOid } from '~/api/service/story'
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
        invite: false,
        likes: [],
        number: null,
        public: false,
        richText: {
          filename: null,
          ref: null
        },
        quote: {
          src: null
        },
        previewOid: null
      },
      mutablePages: [],
      story: {
        id: null,
        title: null,
        summary: null,
        cover: {}
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
          ref: bookDetails.bookSrc,
          contentType: bookDetails.contentType
        }
      })

      EventBus.$on('story-rich-text-file-key', richTextDetails => {
        log(`story-rich-text-file-key event received:`, richTextDetails)
        this.page.richText = {
          filename: richTextDetails.filenameKey,
          ref: richTextDetails.richTextSrc
        }
      })

      EventBus.$on('story-page-quote-save', quote => {
        log(`story-page-quote-save event received:`, quote)
        this.page.quote = {
          src: quote.src,
          color: quote.color,
          background: quote.background
        }
      })

      EventBus.$on('save-pages', pages => {
        log(`savePages event received:`, pages)
        this.mutablePages = this.pages.slice()
      })
    })
  },
  beforeDestroy() {
    EventBus.$off('story-image-file-key')
    EventBus.$off('story-book-file-key')
    EventBus.$off('story-rich-text-file-key')
    EventBus.$off('story-page-quote-save')
    EventBus.$off('save-pages')
  },
  methods: {
    ...mapActions('story', ['saveStory']),
    loadPage(pageOid) {
      // todo clean up this logic
      if (this.user.uid) {
        findPageByOid(pageOid)
          .then(pageDoc => {
            if (pageDoc.exists) {
              log('parents page:', pageDoc.data().parentPagesOid)

              if (pageDoc.data().parentPagesOid) {
                // find parent page to use to init story
                findPageByOid(pageDoc.data().parentPagesOid)
                  .then(parentPageDoc => {
                    if (parentPageDoc.exists) {
                      this.initPage(
                        parentPageDoc.id,
                        parentPageDoc.data(),
                        pageOid
                      )
                    } else {
                      this.$toast.error('Page does not exist')
                    }
                  })
                  .catch(error => log('err', error))
              } else {
                this.initPage(pageDoc.id, pageDoc.data(), pageOid)
              }
            } else {
              this.$toast.error('Page does not exist')
            }
          })
          .catch(error => log('err', error))
      }
    },
    initPage(pageOid, pageData, selectedPageOid) {
      log('in init page:', pageOid)
      this.page = {
        id: pageOid,
        book: { ...pageData.book },
        chapterOid: pageData.chapterOid,
        comments: pageData.comments ? clonedeep(pageData.comments) : [],
        image: { ...pageData.image },
        likes: pageData.likes,
        page: pageData.page,
        invite: pageData.invite,
        public: pageData.public,
        richText: pageData.richText,
        quote: pageData.quote,
        storyOid: pageData.storyOid,
        uid: pageData.uid,
        previewOid: pageData.previewRef ? pageData.previewRef.id : undefined,
        selectedPageOid: selectedPageOid
      }

      log('this page:', this.page)

      if (this.isAuthorised()) {
        this.initAuthorUser(this.page.uid)
        this.initStory(this.page.storyOid)
        this.initChapter(this.page.chapterOid)

        // todo save page to store
      } else {
        this.$toast.error('User not authorised to view this page')
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

          // todo save chpater to store
        } else {
          this.$toast.error('Chapter does not exist')
        }
      })
    },
    isAuthorised() {
      return this.page.public || this.page.uid === this.user.uid
    },
    deletePage(page) {
      log('delete:', page)

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

        if (this.totalStoryPages > 1 && chapterPageCount === 1) {
          log('deleting whole chapter', page.chapterOid)
          return deleteChapter(page.chapterOid)
        } else {
          log('deleting page')
          return deletePage(page.id)
        }
      }

      deleteStoryCover()
        .then(() => {
          log('cover removed from page')
          return runDelete()
        })
        .then(() => {
          return this.fetchNexPageOid(page)
        })
        .then(pageOid => {
          log('routing to next pageOid', pageOid)
          this.$router.push(`/story/${pageOid}`)
        })
        .catch(error => {
          log('There was an error deleting the current page', error)
          this.$toast.error(error.message)
        })
    },
    chapterPageCount(pages, chapterOid) {
      return pages.filter(page => page.chapterOid === chapterOid).length
    },
    fetchNexPageOid(currentPage) {
      log('Fetching previous page if exist. page being deleted:', currentPage)
      if (this.totalStoryPages > 1) {
        log(
          'TotalStoryPages and mutablePages:',
          this.totalStoryPages,
          this.mutablePages
        )
        this.mutablePages = this.mutablePages.filter(
          p => p.id !== currentPage.id
        )
        return Promise.resolve(this.mutablePages[0].id)
      } else {
        log('Just deleted only page. Creating new one')
        return this.addNewPage(currentPage.chapterOid)
      }
    },
    addNewPage(chapterOid) {
      return addPage({
        storyOid: this.story.id,
        chapterOid: chapterOid,
        page: 1,
        uid: this.uid,
        invite: false,
        public: false
      }).then(page => {
        log(`Page Document written with ID:${page.id}`)
        return Promise.resolve(page.id)
      })
    }
  }
}
</script>
