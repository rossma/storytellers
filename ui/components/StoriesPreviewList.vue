<template>
  <v-container grid-list-md>
    <v-layout
      row
      wrap>
      <v-flex
        v-for="preview in previews"
        :key="preview.id"
        class="pa-2"
        d-flex
        xs12
        sm6
        md3>
        <v-card class="preview-card">
          <div
            class="preview-detail-link"
            @click="showDetail(preview.storyOid, preview.pageOid)">
            <v-img
              :src="preview.previewImageUrl"
              height="300px"/>
            <v-card-title primary-title>
              <div>
                <div class="headline truncate">{{ preview.title }}</div>
                <span class="grey--text truncate">{{ preview.summary }}</span>
              </div>
            </v-card-title>
          </div>
          <v-card-actions
            v-show="showAction"
            class="black">
            <v-spacer />
            <v-btn icon>
              <v-icon>favorite</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon>bookmark</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon>share</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { findStoriesByUser } from '~/api/service/story'
import { findPagesByStory } from '~/api/service/page'
import { findPreviewsByFilter } from '~/api/service/preview'
import UserStateMixin from '~/mixins/UserStateMixin'

export default {
  name: 'StoriesPreviewList',
  mixins: [ UserStateMixin ],
  props: {
    showAction: {
      type: Boolean,
      default: true
    },
    filterBy: {
      type: Object,
      default: function () {
        return {
          userProfile: null,
          byAuthorUid: null
        }
      }
    }
  },
  watch: {
    user: function (val) {
      console.log('user watch triggered', val)
      if (this.filterBy.userProfile && this.user.uid) {
        this.fetchUserProfileStories()
      }
    }
  },
  data () {
    return {
      previews: []
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    init () {
      console.log('this.filterBy.userProfile', this.filterBy.userProfile)
      if (this.filterBy.userProfile && this.user.uid) {
        this.fetchUserProfileStories()
      } else if (!this.filterBy.userProfile) {
        this.fetchPublicStories()
      }
    },
    fetchUserProfileStories () {
      let stories = null
      findStoriesByUser(this.user.uid).then((storiesSnapshot) => {
        stories = storiesSnapshot

        if (stories.length > 0) {
          this.previews = stories.map((story) => {
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
          console.log('previews:', this.previews)
        } else {
          console.log('There are no stories for this user')
        }
      }).catch((error) => {
        console.log(error)
        this.$toast.error(error.message)
      })
    },
    fetchPublicStories () {
      console.log('fetchUserProfileStories :1', JSON.stringify(this.user))

      findPreviewsByFilter(this.filterBy).then((previewsSnapshot) => {
        this.previews = previewsSnapshot
      }).catch((error) => {
        this.$toast.error(error.message)
      })
    },
    showDetail (storyOid, pageOid) {
      console.log(`storyOid:${storyOid} pageOid:${pageOid}`)
      if (pageOid) {
        this.$router.push(`/story/${pageOid}`)
      } else {
        // in the event no page id is defined in cover take the first page
        findPagesByStory(storyOid).then((pages) => {
          let page = pages.sort((a, b) => a.page - b.page)[0]
          if (page) {
            this.$router.push(`/story/${page.id}`)
          } else {
            this.$toast.error('Page does not exist')
          }
        }).catch((error) => {
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
