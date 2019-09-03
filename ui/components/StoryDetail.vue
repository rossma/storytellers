x`<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-header class="header">
        <v-col
          class="expansion-header-icon">
          <v-icon
            large
            float-left
          >
            mdi-typewriter
          </v-icon>
        </v-col>
        <v-col><h2>{{ story.title }}</h2></v-col>
        <v-col
          v-show="author.displayName"
          @click="showUserProfile()"
          class="text-right"
        >
          <h4 class="primary--text">
            {{ author.displayName }}
          </h4>
        </v-col>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <story-summary
          :story="story"
          :editable="editable"
          :story-exists="true"
          style="padding-bottom:10px;"
        />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import StorySummary from '~/components/StorySummary.vue'
import debug from 'debug'
const log = debug('app:components/StoryDetail')

export default {
  name: 'StoryDetail',
  components: {
    StorySummary
  },
  props: {
    author: {
      type: Object,
      default: () => {
        return {
          displayName: null
        }
      }
    },
    editable: {
      type: Boolean,
      default: false
    },
    story: {
      type: Object,
      default: () => {
        return {
          id: null,
          title: '',
          summary: '',
          created: Date.now(),
          uid: null
        }
      }
    },
    storyExists: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    showUserProfile() {
      log(`show user profile for uid:${this.story.uid}`)
      if (this.story.uid) {
        this.$router.push(`/user/${this.story.uid}`)
      } else {
        this.$toast.error('user does not exist')
      }
    }
  }
}
</script>

<style>
</style>
