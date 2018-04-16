<template>
  <v-expansion-panel>
    <v-expansion-panel-content>
      <div slot="header">
        <div><h2>{{ story.data.title }}</h2></div>
        <div v-show="author.displayName"><h5>{{ author.displayName }}</h5></div>
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
          data: {
            title: '',
            summary: '',
            created: Date.now()
          }
        }
      }
    },
    storyExists: {
      type: Boolean,
      default: false
    }
  }
}
</script>
