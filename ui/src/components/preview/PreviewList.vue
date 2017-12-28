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
          <div>
            <v-card-media
              class="preview-img"
              :src="preview.data.previewImageUrl"
              @click="showDetail(preview.data.storyOid, preview.data.pageOid)"
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
import { mapGetters } from 'vuex'
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
      previews: []
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  mounted: function () {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
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
        // todo raise an alert
        console('Error in loading data', error)
      })
    },
    fetchPublicStories () {
      findPreviewsByFilter(this.filterBy).then((previewsSnapshot) => {
        this.previews = previewsSnapshot
      }).catch((error) => {
        console('Error in loading data', error)
        // todo raise an alert
      })
    },
    showDetail (storyOid, pageOid) {
      console.log(`storyOid:${storyOid} previewOid:${pageOid}`)
      if (pageOid) {
        this.$router.push('/story/detail/' + pageOid)
      } else {
        // in the event no page id is defined in cover take the first page
        findPagesByStory(storyOid).then((pages) => {
          let page = pages.find(p => p.data.page === 1)
          if (page) {
            this.$router.push('/story/detail/' + page.id)
          } else {
            // todo raise an error
            console.log('Error - page does not exits')
          }
        }).error((error) => {
          // todo raise an error
          console.log('Error - fetching pages for story', error)
        })
      }
    }
  }
}
</script>

<style>
.preview-img {
  cursor: pointer;
}

.preview-card {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}
</style>
