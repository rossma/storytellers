<template>
  <div>
    <v-speed-dial
      v-model="dial.fab"
      :direction="dial.direction"
      :hover="dial.hover"
      :transition="dial.transition"
      bottom
      fixed
      right
    >
      <template #activator="{ on }">
        <v-btn
          v-if="canPublish() || canDeletePage()"
          v-on="on"
          v-model="dial.fab"
          color="indigo darken-2"
          dark
          fab
          hover
        >
          <v-icon>launch</v-icon>
        </v-btn>
      </template>
      <v-tooltip left>
        <template #activator="{ on }">
          <v-btn
            v-if="canPublish()"
            v-on="on"
            color="green"
            fab
            dark
            small
            @click="publishDialog = true"
          >
            <v-icon>publish</v-icon>
          </v-btn>
          <span>Publish Page</span>
        </template>
      </v-tooltip>
      <v-tooltip left>
        <template #activator="{ on }">
          <v-btn
            v-if="canDeletePage()"
            v-on="on"
            color="red"
            fab
            dark
            small
            @click.stop="deletePageDialog = true"
          >
            <v-icon>delete</v-icon>
          </v-btn>
          <span>Delete Page</span>
        </template>
      </v-tooltip>
    </v-speed-dial>
    <v-dialog
      v-model="deletePageDialog"
      persistent
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          Delete Page?
        </v-card-title>
        <v-card-text>Are you sure you want to delete this page?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="indigo darken-1"
            @click="deleteCurrentPage"
          >
            Yes
          </v-btn>
          <v-btn
            color="darken-1"
            @click.native="deletePageDialog = false"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <page-publish
      :dialog="publishDialog"
      :page="page"
      :uid="user.uid"
      :user-display-name="user.data.displayName ? user.data.displayName : 'Anon'"
      @close="publishDialog = false"
      @published="isPublicPage = true"
    />
  </div>
</template>

<script>
import PagePublish from '~/components/PagePublish'

export default {
  name: 'StoryActionControls',
  components: {
    PagePublish
  },
  props: {
    page: {
      type: Object,
      required: true
    },
    totalStoryPages: {
      type: Number,
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      publishDialog: false,
      deletePageDialog: false,
      dial: {
        fab: false,
        direction: 'top',
        hover: false,
        transition: 'slide-y-reverse-transition'
      },
      isPublicPage: this.page.public
    }
  },
  methods: {
    canPublish() {
      return !this.isPublicPage && this.page.uid === this.user.uid
    },
    deleteCurrentPage() {
      this.deletePageDialog = false
      this.$emit('delete-page', this.page)
    },
    canDeletePage() {
      return this.editable && this.totalStoryPages > 1
    }
  }
}
</script>
