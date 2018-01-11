<template>
  <v-container grid-list-xl>
    <v-layout>
      <v-flex>
        <v-card>
          <v-card-title
            primary
            class="title">Create Story
          </v-card-title>
          <v-card-text>
            <story-detail :editable="true" />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import StoryDetail from '~/components/story/StoryDetail.vue'

export default {
  components: {StoryDetail}
}
</script>
