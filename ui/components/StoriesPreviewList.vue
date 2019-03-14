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
        <v-hover>
          <v-card
            slot-scope="{ hover }"
            :class="`elevation-${hover ? 12 : 2}`"
            class="mx-auto preview-card"
          >
            <div
              class="preview-detail-link"
              @click="showDetail(preview.storyOid, preview.pageOid)"
            >
              <v-img
                :src="preview.previewImageUrl"
                height="300px"
              />
              <v-card-title primary-title>
                <div>
                  <div class="headline truncate">
                    {{ preview.title }}
                  </div>
                  <span class="grey--text truncate">{{ preview.summary }}</span>
                </div>
              </v-card-title>
            </div>
            <v-card-actions
              v-show="showActions"
              class="black"
            >
              <h3>
                <nuxt-link :to="'/user/' + preview.uid">
                  {{ preview.userDisplayName || 'Anon' }}
                </nuxt-link>
              </h3>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { findStoriesByUser } from '~/api/service/story'
import { findPagesByStory } from '~/api/service/page'
import { findPreviewsByFilter } from '~/api/service/preview'
import UserStateMixin from '~/mixins/UserStateMixin'
import debug from 'debug'
const log = debug('app:components/StoriesPreviewList')

export default {
  name: 'StoriesPreviewList',
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
    user: function(val) {
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

              let cover = storyCover()

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
          if (!this.previews || this.previews.length == 0) {
            this.$toast.info('Sorry, there are no results based om you search')
          }
        })
        .catch(error => {
          log(error)
          this.$toast.error(error.message)
        })
    },
    showDetail(storyOid, pageOid) {
      log(`storyOid:${storyOid} pageOid:${pageOid}`)
      if (pageOid) {
        this.$router.push(`/story/${pageOid}`)
      } else {
        // in the event no page id is defined in cover take the first page
        findPagesByStory(storyOid)
          .then(pages => {
            let page = pages.sort((a, b) => a.page - b.page)[0]
            if (page) {
              this.$router.push(`/story/${page.id}`)
            } else {
              this.$toast.error('Page does not exist')
            }
          })
          .catch(error => {
            this.$toast.error(error.message)
          })
      }
    }
  }
}
</script>

<style>
.preview-detail-link {
  cursor: pointer;
}

.preview-card {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}
</style>
