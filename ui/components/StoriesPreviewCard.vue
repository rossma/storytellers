<template>
  <v-hover>
    <v-card
      slot-scope="{ hover }"
      :class="`elevation-${hover ? 12 : 2}`"
      class="mx-auto preview-card"
    >
      <v-badge
        v-model="showInviteBadge"
        color="secondary"
        left
        overlap
      >
        <template #badge>
          <v-icon
            dark
            small
          >
            group
          </v-icon>
        </template>
        <div
          class="preview-detail-link"
          @click="showDetail(preview.storyOid, preview.pageOid)"
        >
          <v-img
            v-if="preview.previewImageUrl"
            :src="preview.previewImageUrl"
          />
          <div
            v-else
            class="v-responsive v-image no-image"
          >
            {{ preview.summary }}
          </div>
          <v-card-title primary-title>
            <div>
              <div class="headline truncate">
                {{ preview.title }}
              </div>
              <span class="grey--text truncate">{{ preview.summary }}</span>
            </div>
          </v-card-title>
        </div>
      </v-badge>
      <v-card-actions
        v-show="showActions"
        class="primary"
      >
        <h3>
          <nuxt-link :to="'/user/' + preview.uid">
            {{ preview.userDisplayName || 'Anon' }}
          </nuxt-link>
        </h3>
      </v-card-actions>
    </v-card>
  </v-hover>
</template>

<script>
import { findPagesByStory } from '~/api/service/page'

import debug from 'debug'
const log = debug('app:components/StoriesPreviewCard')

export default {
  name: 'StoriesPreviewCard',
  props: {
    preview: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showInviteBadge: this.preview.invite || false
    }
  },
  methods: {
    showDetail(storyOid, pageOid) {
      log(`storyOid:${storyOid} pageOid:${pageOid}`)
      if (pageOid) {
        this.$router.push(`/story/${pageOid}`)
      } else {
        // in the event no page id is defined in cover take the first page
        findPagesByStory(storyOid)
          .then(pages => {
            const page = pages.sort((a, b) => a.page - b.page)[0]
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

.preview-detail-link .v-image,
.preview-detail-link .no-image {
  height: 300px;
}

.preview-detail-link .no-image {
  border: 1px solid darkgray;
  font-weight: bold;
  /*padding: 10px;*/
  font-size: 3.75vw;
  word-break: break-all;
  text-align: center;
  text-justify: auto;
}

.v-card__actions h3 a {
  color: white;
}
</style>
