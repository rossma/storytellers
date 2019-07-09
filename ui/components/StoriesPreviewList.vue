<template>
  <v-container grid-list-md>
    <v-layout
      row
      wrap
    >
      <v-flex
        v-for="preview in previews"
        :key="preview.id"
        class="pa-2"
        d-flex
        xs12
        sm6
        md3
      >
        <stories-preview-card
          :preview="preview"
          :show-actions="showActions"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { findStoriesByUser } from '~/api/service/story'
import { findPreviewsByFilter } from '~/api/service/preview'
import StoriesPreviewCard from '~/components/StoriesPreviewCard'
import UserStateMixin from '~/mixins/UserStateMixin'
import debug from 'debug'
const log = debug('app:components/StoriesPreviewList')

export default {
  name: 'StoriesPreviewList',
  components: {
    StoriesPreviewCard
  },
  mixins: [UserStateMixin],
  props: {
    filterBy: {
      type: Object,
      default: function() {
        return {
          byAuthorUid: null
        }
      }
    },
    isPrivateUserProfile: {
      type: Boolean,
      default: false
    },
    isPublicUserProfile: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      previews: []
    }
  },
  watch: {
    user: function() {
      if (this.isPrivateUserProfile && this.user.uid) {
        this.fetchUserProfileStories()
      }
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    init() {
      if (this.isPrivateUserProfile && this.user.uid) {
        this.fetchUserProfileStories()
      } else {
        this.fetchPreviews()
      }
    },
    fetchUserProfileStories() {
      let stories = null
      findStoriesByUser(this.user.uid)
        .then(storiesSnapshot => {
          stories = storiesSnapshot

          if (stories.length > 0) {
            this.previews = stories.map(story => {
              const storyCover = () => {
                if (story.cover && story.cover.ref) {
                  return story.cover
                } else {
                  return {
                    chapterOid: null,
                    pageOid: null,
                    ref: '/img/missing-image.png'
                  }
                }
              }

              const cover = storyCover()

              return {
                chapterOid: cover.chapterOid,
                pageOid: cover.pageOid,
                previewImageUrl: cover.ref,
                storyOid: story.id,
                summary: story.summary,
                title: story.title,
                uid: story.uid,
                userDisplayName: this.user.data.displayName
              }
            })
            log('previews:', this.previews)
          } else {
            log('There are no stories for this user')
          }
        })
        .catch(error => {
          log(error)
          this.$toast.error(error.message)
        })
    },
    fetchPreviews() {
      findPreviewsByFilter(this.filterBy)
        .then(previewsSnapshot => {
          this.previews = previewsSnapshot
          if (!this.previews || this.previews.length === 0) {
            this.$toast.info('Sorry, there are no results based om you search')
          }
        })
        .catch(error => {
          log(error)
          this.$toast.error(error.message)
        })
    }
  }
}
</script>
