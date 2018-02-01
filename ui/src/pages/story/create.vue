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
            <story-summary :editable="true" />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import StorySummary from '~/components/story/StorySummary.vue'

export default {
  components: {StorySummary}
}
</script>
