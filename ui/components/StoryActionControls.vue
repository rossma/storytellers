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
      <template #activator>
        <v-btn
          v-if="canPublish() || canDeletePage() || canInvite()"
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
            primary
            fab
            dark
            small
            v-on="on"
            @click="publishDialog = true"
          >
            <v-icon>publish</v-icon>
          </v-btn>
        </template>
        <span>Publish Page</span>
      </v-tooltip>
      <v-tooltip left>
        <template #activator="{ on }">
          <v-btn
            v-if="canInvite()"
            color="secondary"
            fab
            dark
            small
            v-on="on"
            @click="publishDialog = true"
          >
            <v-icon>group_add</v-icon>
          </v-btn>
        </template>
        <span>Invite Collaboration</span>
      </v-tooltip>
      <v-tooltip left>
        <template #activator="{ on }">
          <v-btn
            v-if="canDeletePage()"
            color="red"
            fab
            dark
            small
            v-on="on"
            @click.stop="deletePageDialog = true"
          >
            <v-icon>delete</v-icon>
          </v-btn>
        </template>
        <span>Delete Page</span>
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
            color="primary"
            @click="deleteCurrentPage"
          >
            <v-icon left>done</v-icon>
            Yes
          </v-btn>
          <v-btn @click.native="deletePageDialog = false">
            <v-icon left>clear</v-icon>
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
      :is-published="isPublicPage"
      @close="publishDialog = false"
      @published="onPublishComplete"
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
      isInvitePage: this.page.invite,
      isPublicPage: this.page.public
    }
  },
  methods: {
    canPublish() {
      return !this.isPublicPage && this.page.uid === this.user.uid
    },
    canInvite() {
      return (
        !this.isInvitePage &&
        this.isPublicPage &&
        this.page.uid === this.user.uid
      )
    },
    deleteCurrentPage() {
      this.deletePageDialog = false
      this.$emit('delete-page', this.page)
    },
    canDeletePage() {
      return this.editable && this.totalStoryPages > 1
    },
    onPublishComplete(isInvite) {
      this.isPublicPage = true
      this.isInvitePage = isInvite
    }
  }
}
</script>
