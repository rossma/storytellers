<template>
  <v-expansion-panel>
    <v-expansion-panel-content>
      <div slot="header">
        <div><h2>{{ story.title }}</h2></div>
        <div
          v-show="author.displayName"
          @click="showUserProfile()">
          <h4>{{ author.displayName }}</h4>
        </div>
      </div>
      <story-summary
        :story="story"
        :editable="editable"
        :story-exists="true"
        style="padding-bottom:10px;"/>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import StorySummary from '~/components/StorySummary.vue'

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
    showUserProfile () {
      console.log(`show user profile for uid:${this.story.uid}`)
      if (this.story.uid) {
        this.$router.push(`/user/${this.story.uid}`)
      } else {
        this.$toast.error('user does not exist')
      }
    }
  }
}
</script>
