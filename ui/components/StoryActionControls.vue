<template>
  <div>
    <v-speed-dial
      v-model="dial.fab"
      :direction="dial.direction"
      :hover="dial.hover"
      :transition="dial.transition"
      bottom
      fixed
      right>
      <v-btn
        v-if="canPublish() || canDeletePage()"
        slot="activator"
        v-model="dial.fab"
        color="blue darken-2"
        dark
        fab
        hover>
        <v-icon>launch</v-icon>
      </v-btn>
      <v-tooltip left>
        <v-btn
          v-if="canPublish()"
          slot="activator"
          color="green"
          fab
          dark
          small
          @click="publish">
          <v-icon>publish</v-icon>
        </v-btn>
        <span>Publish Page</span>
      </v-tooltip>
      <v-tooltip left>
        <v-btn
          v-if="canDeletePage()"
          slot="activator"
          color="red"
          fab
          dark
          small
          @click.stop="deletePageDialog = true">
          <v-icon>delete</v-icon>
        </v-btn>
        <span>Delete Page</span>
      </v-tooltip>
    </v-speed-dial>
    <v-dialog
      v-model="deletePageDialog"
      persistent
      max-width="290">
      <v-card>
        <v-card-title class="headline">Delete Page?</v-card-title>
        <v-card-text>Are you sure you want to delete this page?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            @click="deleteCurrentPage">Yes</v-btn>
          <v-btn
            color="darken-1"
            @click.native="deletePageDialog = false">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import stringUtils from '~/utils/string'
import { publishPage } from '~/api/service/page'
import { findImageByOid } from '~/api/service/image'

export default {
  name: 'StoryActionControls',
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
  data () {
    return {
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
  computed: {
    ...mapGetters('modules/story', [
      'story'
    ])
  },
  methods: {
    canPublish () {
      return !this.isPublicPage && this.page.uid === this.user.uid
    },
    findImageFilenameKey () {
      if (this.page.image && this.page.image.filename) {
        const filenameKey = this.page.image.filename.split('.').shift()
        return findImageByOid(filenameKey)
      } else {
        return Promise.reject(new Error('Image reference can not be found'))
      }
    },
    publish () {
      this.findImageFilenameKey().then((imageDoc) => {
        if (imageDoc.exists) {
          let preview = {
            storyOid: this.story.id,
            chapterOid: this.page.chapterOid,
            pageOid: this.page.id,
            title: this.story.title,
            summary: stringUtils.truncateWithEllipse(this.story.summary, 100),
            uid: this.user.uid,
            userDisplayName: this.user.data.displayName,
            previewImageUrl: imageDoc.data().previewUrl,
            imageFilenameOid: imageDoc.id,
            created: Date.now()
          }
          return publishPage(preview)
        } else {
          // possible if the server function hasn't run yet
          console.log('Image Document not found in DB at this time')
          return Promise.reject(new Error('There was an error finding image reference'))
        }
      }).then(() => {
        this.isPublicPage = true
        this.$toast.success('Story published')
      }).catch((error) => {
        console.log('There was an error publishing page', error)
        this.$toast.error(error.message)
      })
    },
    deleteCurrentPage () {
      this.deletePageDialog = false
      EventBus.$emit('deletePage', this.page)
    },
    canDeletePage () {
      return this.editable && this.totalStoryPages > 1
    }
  }
}
</script>

<style scoped>

</style>
