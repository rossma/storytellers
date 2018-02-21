<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="290">
    <v-card>
      <v-card-title class="headline">Delete Story?</v-card-title>
      <v-card-text>Are you sure you want to delete this story?</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="blue darken-1"
          @click="deleteStory">Yes</v-btn>
        <v-btn
          color="darken-1"
          @click.native="closeDialog()">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { deleteStory } from '~/api/service/story'

export default {
  name: 'StoryDeleteDialog',
  props: {
    story: {
      type: Object,
      required: true
    },
    dialog: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    closeDialog () {
      this.$emit('close', false)
    },
    deleteStory () {
      deleteStory(this.story.id).then(() => {
        this.$router.push('/user/profile')
      }).catch((error) => {
        this.$toast.error(`There was an error deleting story:${error.message}`)
      })
    }
  }
}
</script>
