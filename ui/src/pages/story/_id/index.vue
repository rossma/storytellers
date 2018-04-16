<template>
  <v-container grid-list-xl>
    <v-layout
      v-if="story.id"
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
import { findPageByOid } from '~/api/service/page'
import { findUserByOid } from '~/api/service/user'
import { findStoryByOid } from '~/api/service/story'
import { findChapterByOid } from '~/api/service/chapter'
import StoryActionControls from '~/components/StoryActionControls.vue'
import StoryDetail from '~/components/StoryDetail.vue'
import StoryTabs from '~/components/StoryTabs.vue'

export default {
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
        data: {
          number: null
        }
      },
      page: {
        id: null,
        data: {
          number: null
        }
      },
      story: {
        id: null,
        data: {
          summary: null
        },
        ext: {}
      }
    }
  },
  computed: {
    ...mapGetters('modules/user', [
      'user'
    ]),
    ...mapGetters('modules/page', [
      'pages'
    ]),
    isEditable: function () {
      return this.page.data.uid === this.user.uid
    },
    totalStoryPages: function () {
      if (this.pages) {
        return this.pages.length
      } else {
        return 0
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      console.log('[Story Detail] - in mounted, page id:', this.$route.params.id)
      this.loadPage(this.$route.params.id)

      EventBus.$on('storyImageFileKey', imageDetails => {
        console.log(`[Story Detail] - storyImageFileKey event received:`, imageDetails)
        this.page.data.image = {
          filename: imageDetails.filenameKey,
          ref: imageDetails.imageSrc
        }
      })
    })
  },
  beforeDestroy () {
    EventBus.$off('storyImageFileKey')
  },
  methods: {
    ...mapActions('modules/story', ['saveStory']),
    loadPage (pageOid) {
      findPageByOid(pageOid).then((pageDoc) => {
        if (pageDoc.exists) {
          this.page.id = pageOid
          this.page.data = pageDoc.data()
          if (this.isAuthorised()) {
            this.initAuthorUser(this.page.data.uid)
            this.initStory(this.page.data.storyOid)
            this.initChapter(this.page.data.chapterOid)
          } else {
            this.$toast.error('User not authorised to view this page')
          }
        } else {
          this.$toast.error('Page does not exist')
        }
      })
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
          this.story.data = storyDoc.data()
          this.story.ext.activePage = this.page
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
          this.chapter.data = chapterDoc.data()
        } else {
          this.$toast.error('Chapter does not exist')
        }
      })
    },
    isAuthorised () {
      return this.page.data.public || this.page.data.uid === this.user.uid
    }
  }
}
</script>
