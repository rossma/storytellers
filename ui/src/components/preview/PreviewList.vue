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
              @click="showDetail(preview.data.pageOid)"
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
import { findPagesByUser } from '~/service/page'
import { findStoriesByUser } from '~/service/story'
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
      let pages = null
      findPagesByUser(this.user.uid).then((pageSnapshot) => {
        pages = pageSnapshot
        if (pages.length > 0) {
          return findStoriesByUser(this.user.uid)
        } else {
          console.log('There are no private pages for this user')
          return Promise.reject(new Error('There are no private pages for this user'))
        }
      }).then((stories) => {
        this.previews = pages.map((page) => {
          let story = stories.find(x => x.id === page.data.storyOid)
          let preview = {
            data: {
              chapterOid: page.data.chapterOid,
              pageOid: page.id,
              previewImageUrl: page.data.image.ref,
              storyOid: page.data.storyOid,
              summary: story.data.summary,
              title: story.data.title,
              uid: page.data.uid,
              userDisplayName: this.user.data.displayName
            }
          }
          console.log('preview:', preview)
          return preview
        })
      }).catch((error) => {
        console('Error in loading data', error)
        // todo raise an alert
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
    showDetail (pageOid) {
      console.log('previewOid:', pageOid)
      this.$router.push('/story/detail/' + pageOid)
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
