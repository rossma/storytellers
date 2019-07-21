<template>
  <v-hover>
    <v-card
      slot-scope="{ hover }"
      :class="`elevation-${hover ? 12 : 2}`"
      class="mx-auto contribution-card"
    >
      <div
        class="preview-detail-link"
        @click.stop="showDetail()"
      >
        <v-img
          v-if="childPage.image && childPage.image.ref"
          :src="childPage.image.ref"
        />
        <v-img
          v-else-if="childPage.wallpaperUrl"
          :src="childPage.wallpaperUrl"
        >
          <v-container fill-height fluid>
            <v-layout fill-height>
              <v-flex xs12 align-end flexbox>
                <span class="headline no-image-text">{{ childPage.summary }}</span>
              </v-flex>
            </v-layout>
          </v-container>
        </v-img>
        <v-card-title primary-title>
          <div>
            <div class="headline truncate">
              <nuxt-link :to="'/user/' + childPage.uid">
                {{ childPage.userDisplayName }}
              </nuxt-link>
            </div>
            <span class="grey--text truncate">{{ childPage.summary }}</span>
          </div>
        </v-card-title>
      </div>
      <v-card-actions
        v-show="showActions"
        class="secondary"
      >
        <v-spacer />
        {{ likes }}
        <v-btn
          icon
          @click="like()"
        >
          <v-icon :color="liked ? 'red' : 'white' ">
            favorite
          </v-icon>
        </v-btn>
        {{ comments }}
        <v-btn
          icon
          @click="commentsDialog = true"
        >
          <v-icon>comments</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-hover>
</template>

<script>
import debug from 'debug'
const log = debug('app:components/PageContributionCard')

export default {
  name: 'PageContributionCard',
  props: {
    childPage: {
      type: Object,
      required: true
    },
    user: {
      type: Object,
      required: true
    }
  },
  computed: {
    liked: {
      get() {
        return false
        // log('in liked get', this.page.likes)
        // if (this.page.likes) {
        //   return this.page.likes.includes(this.user.uid)
        // } else {
        //   return false
        // }
      },
      set(val) {
        log('in liked set')
        // if (!this.page.likes) {
        //   this.page.likes = []
        // }
        //
        // if (val) {
        //   if (!this.page.likes.includes(this.user.uid)) {
        //     this.page.likes.push(this.user.uid)
        //   }
        // } else {
        //   this.page.likes = this.page.likes.filter(el => el !== this.user.uid)
        // }
      }
    },
    comments: function() {
      // if (this.page.comments) {
      //   return this.page.comments.length
      // } else {
      //   return 0
      // }
      return 0
    },
    likes: function() {
      // if (this.page.likes) {
      //   return this.page.likes.length
      // } else {
      //   return 0
      // }
      return 0
    }
  },
  data() {
    return {
      showActions: true
    }
  },
  methods: {
    showDetail() {
      log(
        `storyOid:${this.childPage.storyOid} pageOid:${this.childPage.pageOid}`
      )
      log(`childPage:${this.childPage}`)
      this.$emit('open-viewer', this.childPage)
      // if (pageOid) {
      //   this.$router.push(`/story/${pageOid}`)
      // } else {
      //   // in the event no page id is defined in cover take the first page
      //   findPagesByStory(storyOid)
      //     .then(pages => {
      //       const page = pages.sort((a, b) => a.page - b.page)[0]
      //       if (page) {
      //         this.$router.push(`/story/${page.id}`)
      //       } else {
      //         this.$toast.error('Page does not exist')
      //       }
      //     })
      //     .catch(error => {
      //       this.$toast.error(error.message)
      //     })
      // }
    }
  }
}
</script>

<style>
.preview-detail-link {
  cursor: pointer;
}

.contribution-card {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}

.headline a {
  color: var(--v-secondary-base);
}

.no-image-text {
  font-size: 2.75vw !important;
}
</style>
