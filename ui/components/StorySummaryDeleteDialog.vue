<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="290"
  >
    <v-card>
      <v-card-title class="headline">
        Delete Story?
      </v-card-title>
      <v-card-text>Are you sure you want to delete this story?</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          @click="deleteStory"
        >
          <v-icon float-left>
            mdi-check
          </v-icon>
          Yes
        </v-btn>
        <v-btn
          @click.native="closeDialog()"
        >
          <v-icon float-left>
            mdi-close
          </v-icon>
          No
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import { deleteStory } from '~/api/service/story'
import debug from 'debug'
const log = debug('app:components/StorySummaryDeleteDialog')

export default {
  name: 'StorySummaryDeleteDialog',
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
    ...mapActions('story', ['resetState']),
    closeDialog() {
      this.$emit('close', false)
    },
    deleteStory() {
      deleteStory(this.story.id)
        .then(() => {
          this.resetState()
          this.$router.push('/user/profile')
        })
        .catch(error => {
          log('Error deleting story:', error)
          this.$toast.error(`There was an error deleting story`)
        })
    }
  }
}
</script>
