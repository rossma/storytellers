<template>
  <v-container grid-list-xl>
    <v-layout justify-center>
      <v-flex xs12>
        <v-toolbar color="primary">
          <v-icon
            large
            float-left
            class="btn-look"
          >
            mdi-typewriter
          </v-icon>
          <v-toolbar-title>Create Story</v-toolbar-title>
        </v-toolbar>
        <v-card>
          <v-card-text>
            <story-summary :editable="true" />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import StorySummary from '~/components/StorySummary.vue'

export default {
  components: { StorySummary },
  layout: 'default-protected'
}
</script>
