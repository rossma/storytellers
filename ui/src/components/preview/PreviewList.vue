<template>
  <v-container grid-list-md>
    <v-layout
      row
      wrap>
      <v-flex
        d-flex
        xs12
        sm6
        md3
        class="pa-2"
        v-for="preview in previews"
        :key="preview.id" >
        <v-card class="preview-card">
          <div
            class="preview-detail-link"
            @click="showDetail(preview.data.storyOid, preview.data.pageOid)">
            <v-card-media
              :src="preview.data.previewImageUrl"
              height="300px"/>
            <v-card-title primary-title>
              <div>
                <div class="headline truncate">{{ preview.data.title }}</div>
                <span class="grey--text truncate">{{ preview.data.summary }}</span>
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
import { mapActions } from 'vuex'
import { findStoriesByUser } from '~/service/story'
import { findPagesByStory } from '~/service/page'
import { findPreviewsByFilter } from '~/service/preview'

export default {
  name: 'PreviewList',
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
  data () {
    return {
      previews: [],
      user: null
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      this.loadUser().then((user) => {
        this.user = user
        this.init()
      })
    })
  },
  methods: {
    ...mapActions([
      'loadUser'
    ]),
    init () {
      if (this.filterBy.userProfile) {
        this.fetchUserProfileStories()
      } else {
        this.fetchPublicStories()
      }
    },
    fetchUserProfileStories () {
      let stories = null
      findStoriesByUser(this.user.uid).then((storiesSnapshot) => {
        stories = storiesSnapshot
        if (stories.length > 0) {
          // todo initialise previews from cover image
          this.previews = stories.map((story) => {
            if (!story.data.cover) {
              story.data.cover = {
                chapterOid: null,
                pageOid: null,
                imageRef: '/img/missing-image.png'
              }
            }
            return {
              data: {
                chapterOid: story.data.cover.chapterOid,
                pageOid: story.data.cover.pageOid,
                previewImageUrl: story.data.cover.imageRef,
                storyOid: story.id,
                summary: story.data.summary,
                title: story.data.title,
                uid: story.data.uid,
                userDisplayName: this.user.data.displayName
              }
            }
          })
          console.log('previews:', this.previews)
        } else {
          console.log('There are no stories for this user')
        }
      }).catch((error) => {
        this.$toast.error(error.message)
      })
    },
    fetchPublicStories () {
      findPreviewsByFilter(this.filterBy).then((previewsSnapshot) => {
        this.previews = previewsSnapshot
      }).catch((error) => {
        this.$toast.error(error.message)
      })
    },
    showDetail (storyOid, pageOid) {
      console.log(`storyOid:${storyOid} pageOid:${pageOid}`)
      if (pageOid) {
        this.$router.push(`/story/detail/${pageOid}`)
      } else {
        // in the event no page id is defined in cover take the first page
        findPagesByStory(storyOid).then((pages) => {
          let page = pages.find(p => p.data.page === 1)
          if (page) {
            this.$router.push(`/story/detail/${page.id}`)
          } else {
            this.$toast.error('Page does not exits')
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
