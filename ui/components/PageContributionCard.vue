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
        <v-sheet
          v-else-if="backgroundColor"
          :color="backgroundColor"
          height="300"
          tile
          justify-center
        >
          <div
            class="quote-block text-center pa-2"
            :class="backgroundTextClass"
          >
            <span class="quote-txt subtitle-1">{{ childPage.quote && childPage.quote.src ? childPage.quote.src : childPage.summary }}</span>
          </div>
        </v-sheet>
        <v-card-title
          class="headline"
        >
          <nuxt-link :to="'/user/' + childPage.uid">
            {{ childPage.userDisplayName }}
          </nuxt-link>
        </v-card-title>
        <v-card-text class="grey--text truncate">
          <span style="white-space: pre-line">{{ childPage.summary }}</span>
        </v-card-text>
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
            mdi-heart
          </v-icon>
        </v-btn>
        {{ comments }}
        <v-btn
          icon
          @click="openCommentsDialog()"
        >
          <v-icon>mdi-comment-outline</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-hover>
</template>

<script>
import debug from 'debug'
import { updatePage } from '~/api/service/page'
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
  data() {
    return {
      showActions: true
    }
  },
  computed: {
    liked: {
      get() {
        log('in liked get', this.childPage.likes)
        if (this.childPage.likes) {
          return this.childPage.likes.includes(this.user.uid)
        } else {
          return false
        }
      },
      set(val) {
        log('in liked set', val, this.childPage.likes)
        if (!this.childPage.likes) {
          this.$set(this.childPage, 'likes', [])
        }
        if (val) {
          if (!this.childPage.likes.includes(this.user.uid)) {
            this.childPage.likes.push(this.user.uid)
          }
        } else {
          this.childPage.likes = this.childPage.likes.filter(
            el => el !== this.user.uid
          )
        }
      }
    },
    comments: function() {
      if (this.childPage.comments) {
        return this.childPage.comments.length
      } else {
        return 0
      }
    },
    likes: function() {
      if (this.childPage.likes) {
        return this.childPage.likes.length
      } else {
        return 0
      }
    },
    backgroundColor: function() {
      if (this.childPage.quote && this.childPage.quote.background) {
        return this.childPage.quote.background
      } else if (this.childPage.background && this.childPage.background.color) {
        return this.childPage.background.color
      } else {
        return null
      }
    },
    backgroundFontColor: function() {
      if (this.childPage.quote && this.childPage.quote.color) {
        return this.childPage.quote.color
      } else if (
        this.childPage.background &&
        this.childPage.background.font &&
        this.childPage.background.font.color
      ) {
        return this.childPage.background.font.color
      } else {
        return `#ffffff`
      }
    },
    backgroundTextClass: function() {
      // todo ... handle font color
      return this.backgroundFontColor === '#000000'
        ? `black--text`
        : `white--text`
    }
  },
  methods: {
    showDetail() {
      log(
        `storyOid:${this.childPage.storyOid} pageOid:${this.childPage.pageOid}`
      )
      log(`childPage:${this.childPage}`)
      this.$emit('open-viewer', this.childPage)
    },
    like() {
      log('in like', this.liked)
      this.liked = !this.liked
      log('updating page', this.childPage.id, this.childPage.likes)
      updatePage(this.childPage.id, { likes: this.childPage.likes })
    },
    openCommentsDialog() {
      this.$emit('open-comments', this.childPage)
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
  /*width: -webkit-fill-available;*/
  /*width: -moz-available;*/
  width: stretch;
}

.headline a {
  color: var(--v-secondary-base);
}

.no-image-text {
  /*font-size: 2.75vw !important;*/
  overflow-wrap: break-word;
  word-break: break-word;
}
</style>
