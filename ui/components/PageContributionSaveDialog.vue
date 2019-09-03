<template>
  <v-layout 
    justify-center
  >
    <v-dialog 
      v-model="dialog"
      persistent
      width="600px"
    >
      <v-card>
        <v-toolbar 
          color="secondary"
        >
          <v-toolbar-title>Save and Publish Page Collaboration</v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            @click="closeDialog()"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex>
                <v-textarea
                  v-model="summary"
                  auto-grow
                  filled
                  color="secondary"
                  label="Summary"
                  rows="4"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="save"
          >
            <v-icon float-left>
              mdi-content-save-outline
            </v-icon>
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import debug from 'debug'
const log = debug('app:components/PageContributionSaveDialog')

export default {
  name: 'PageContributionSaveDialog',
  props: {
    dialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      summary: ''
    }
  },
  methods: {
    save() {
      log('saving')
      this.$emit('save', this.summary)
    },
    closeDialog() {
      this.$emit('close', false)
    }
  }
}
</script>
