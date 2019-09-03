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
          :color="theme"
        >
          <v-toolbar-title>{{ title }}</v-toolbar-title>
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
                  v-if="!isPublished"
                  v-model="summary"
                  auto-grow
                  filled
                  color="primary"
                  label="Summary"
                  maxlength="500"
                  rows="1"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            @click="publish(true)"
          >
            Invite
          </v-btn>
          <v-btn
            v-if="!isPublished"
            color="primary"
            @click="publish(false)"
          >
            Publish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import debug from 'debug'
import stringUtils from '~/utils/string'

import { mapGetters } from 'vuex'
import {
  publishPage,
  setPageAndPreviewInviteState,
  getRandomPreviewWallpaper
} from '~/api/service/page'
import { findImageByOid } from '~/api/service/image'

const log = debug('app:components/PagePublish')

export default {
  name: 'PagePublish',
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    page: {
      type: Object,
      required: true
    },
    uid: {
      type: String,
      required: true
    },
    userDisplayName: {
      type: String,
      required: true
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      summary: '',
      summaryDialog: false,
      isInvite: false
    }
  },
  computed: {
    ...mapGetters('story', ['story']),
    title: function() {
      return this.isPublished ? 'Invite Collaborators' : 'Publish Story'
    },
    theme: function() {
      return this.isPublished ? 'secondary' : 'primary'
    }
  },
  created: function() {},
  methods: {
    findImageFilenameKey() {
      if (this.page.image && this.page.image.filename) {
        const filenameKey = this.page.image.filename.split('.').shift()
        return findImageByOid(filenameKey)
      } else {
        return Promise.resolve()
      }
    },
    publish(isInvite) {
      if (this.isPublished) {
        log('page already published just need to send invitation')
        this.updatePageAndPreviewInviteState(
          this.page.id,
          this.page.previewOid,
          true
        )
      } else {
        let keywords = []
        let authorTags = []

        log('publish page:', this.summary)
        keywords = stringUtils.findKeywords(this.summary)
        authorTags = stringUtils.findAuthorTags(this.summary)

        this.findImageFilenameKey().then(imageSnapshot => {
          let imageId, imageUrl

          if (imageSnapshot && imageSnapshot.exists) {
            imageId = imageSnapshot.id
            imageUrl = imageSnapshot.data().previewUrl
          }

          const preview = {
            storyOid: this.story.id,
            chapterOid: this.page.chapterOid,
            pageOid: this.page.id,
            title: this.story.title,
            summary: this.summary,
            uid: this.uid,
            userDisplayName: this.userDisplayName,
            previewImageUrl: imageUrl,
            imageFilenameOid: imageId,
            created: Date.now(),
            keywords: keywords.map(keyword => keyword.toLowerCase()),
            authorTags: authorTags,
            invite: isInvite,
            wallpaperUrl: getRandomPreviewWallpaper()
          }

          log('publishing page with preveiw:', preview)
          publishPage(preview)
            .then(() => {
              this.$emit('published', isInvite)
              this.closeDialog()
              this.$toast.success('Story published')
            })
            .catch(error => {
              log('There was an error publishing page', error)
              this.$toast.error(error.message)
            })
        })
      }
    },
    updatePageAndPreviewInviteState(pageOid, previewOid, isInvite) {
      log(
        'Updating page and preview invite state',
        pageOid,
        previewOid,
        isInvite
      )
      if (previewOid) {
        setPageAndPreviewInviteState(pageOid, previewOid, isInvite)
          .then(() => {
            this.$emit('published', isInvite)
            this.closeDialog()
            this.$toast.success('Invitation sent')
          })
          .catch(error => {
            log(
              'There was an error setting the page and preview to invite',
              error
            )
            this.$toast.error(error.message)
          })
      } else {
        log('No published page found for page:', pageOid)
        this.$toast.error('There was an error, no publish page found')
      }
    },
    closeDialog() {
      this.$emit('close')
    }
  }
}
</script>
