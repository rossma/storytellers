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
          color="tertiary"
          fab
          hover
        >
          <v-icon>mdi-launch</v-icon>
        </v-btn>
      </template>
      <v-tooltip float-left>
        <template #activator="{ on }">
          <v-btn
            v-if="canPublish()"
            primary
            fab
            small
            v-on="on"
            @click="publishDialog = true"
          >
            <v-icon>mdi-publish</v-icon>
          </v-btn>
        </template>
        <span>Publish Page</span>
      </v-tooltip>
      <v-tooltip float-left>
        <template #activator="{ on }">
          <v-btn
            v-if="canInvite()"
            color="secondary"
            fab
            small
            v-on="on"
            @click="publishDialog = true"
          >
            <v-icon>mdi-account-multiple-plus</v-icon>
          </v-btn>
        </template>
        <span>Invite Collaboration</span>
      </v-tooltip>
      <v-tooltip float-left>
        <template #activator="{ on }">
          <v-btn
            v-if="canDeletePage()"
            color="negative"
            fab
            small
            v-on="on"
            @click.stop="deletePageDialog = true"
          >
            <v-icon>mdi-delete</v-icon>
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
            <v-icon float-left>
              mdi-check
            </v-icon>
            Yes
          </v-btn>
          <v-btn @click.native="deletePageDialog = false">
            <v-icon float-left>
              mdi-close
            </v-icon>
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <page-publish
      :dialog="publishDialog"
      :key="publishDialogKey"
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
import { EventBus } from '~/utils/event-bus.js'
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
      publishDialogKey: 0,
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
  mounted: function() {
    this.$nextTick(() => {
      EventBus.$on('story-image-file-key', () => {
        console.log('dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd')
        this.reRenderPublishDialog()
      })
    })
  },
  beforeDestroy() {
    EventBus.$off('story-image-file-key')
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
    },
    reRenderPublishDialog() {
      // force rerender
      this.publishDialogKey += 1
    }
  }
}
</script>
