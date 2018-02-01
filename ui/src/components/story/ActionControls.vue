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
        color="blue darken-2"
        dark
        fab
        hover
        v-model="dial.fab"
      >
        <v-icon>mdi mdi-radiobox-marked</v-icon>
        <v-icon>mdi mdi-radiobox-blank</v-icon>
      </v-btn>
      <v-tooltip left>
        <v-btn
          v-if="canPublish()"
          fab
          dark
          small
          color="green"
          @click="publish"
          slot="activator"
        >
          <v-icon>mdi mdi-publish</v-icon>
        </v-btn>
        <span>Publish Page</span>
      </v-tooltip>
      <v-tooltip left>
        <v-btn
          v-if="canDeletePage()"
          fab
          dark
          small
          color="red"
          @click.stop="deletePageDialog = true"
          slot="activator"
        >
          <v-icon>mdi mdi-delete</v-icon>
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
import stringUtils from '~/utils/string'
import { deleteChapter } from '~/service/chapter'
import { publishPage, deletePage } from '~/service/page'
import { findImageByOid } from '~/service/image'

export default {
  name: 'ActionControls',
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
      isPublicPage: this.page.data.public
    }
  },
  methods: {
    canPublish () {
      return !this.isPublicPage && this.page.data.uid === this.user.uid
    },
    findImageFilenameKey () {
      if (this.page.data.image && this.page.data.image.filename) {
        const filenameKey = this.page.data.image.filename.split('.').shift()
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
            chapterOid: this.chapter.id,
            pageOid: this.page.id,
            title: this.story.data.title,
            summary: stringUtils.truncateWithEllipse(this.story.data.summary, 100),
            uid: this.user.uid,
            userDisplayName: this.user.data.displayName,
            previewImageUrl: imageDoc.data().previewUrl,
            imageFilenameOid: imageDoc.id
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

      const runDelete = () => {
        if (this.chapterPageCount(this.pages, this.page.data.chapterOid) >= 1) {
          return deleteChapter(this.page.data.chapterOid)
        } else {
          return deletePage(this.page.id)
        }
      }

      runDelete().then(() => {
        this.$router.push(`/story/detail/${this.pages.pop().id}`)
      }).catch((error) => {
        console.log('There was an error deleting the current page', error)
        this.$toast.error(error.message)
      })
    },
    chapterPageCount (pages, chapterOid) {
      return pages.filter((page) => page.data.chapterOid === chapterOid).length
    },
    canDeletePage () {
      return this.editable && this.totalStoryPages > 1
    }
  }
}
</script>

<style scoped>

</style>
