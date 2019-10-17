<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="290"
  >
    <v-card>
      <v-toolbar
        color="secondary"
      >
        <v-toolbar-title>Delete Page Collaboration</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="closeDialog()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>Are you sure you want to delete this page?</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          @click="deleteCurrentPage"
        >
          <v-icon float-left>
            mdi-check
          </v-icon>
          Yes
        </v-btn>
        <v-btn @click.native="closeDialog()">
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
export default {
  name: 'PageContributionDeleteDialog',
  props: {
    dialog: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    deleteCurrentPage() {
      this.$emit('delete')
    },
    closeDialog() {
      this.$emit('close', false)
    }
  }
}
</script>
