<template>
  <v-layout
    row
    justify-center
  >
    <v-dialog
      v-model="dialog"
      width="600px"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            @click="closeDialog()"
          >
            <v-icon>close</v-icon>
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
                  box
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
            flat
            color="secondary"
            @click="publish(true)"
          >
            Invite
          </v-btn>
          <v-btn
            v-if="!isPublished"
            flat
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
import { publishPage, setPageAndPreviewInviteState } from '~/api/service/page'

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
    }
  },
  created: function() {},
  methods: {
    // findImageFilenameKey() {
    //   if (this.page.image && this.page.image.filename) {
    //     const filenameKey = this.page.image.filename.split('.').shift()
    //     return findImageByOid(filenameKey)
    //   } else {
    //     // todo ... image shold not be mandatory
    //     return Promise.reject(new Error('Image reference can not be found'))
    //   }
    // },
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

        const preview = {
          storyOid: this.story.id,
          chapterOid: this.page.chapterOid,
          pageOid: this.page.id,
          title: this.story.title,
          summary: this.summary,
          uid: this.uid,
          userDisplayName: this.userDisplayName,
          // previewImageUrl: imageDoc.data().previewUrl,
          // imageFilenameOid: imageDoc.id,
          created: Date.now(),
          keywords: keywords,
          authorTags: authorTags,
          invite: isInvite
        }
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

        //
        // this.findImageFilenameKey()
        //   .then(imageDoc => {
        //     // todo imageDoc shouldn't be mandatory
        //     if (imageDoc.exists) {
        //       const preview = {
        //         storyOid: this.story.id,
        //         chapterOid: this.page.chapterOid,
        //         pageOid: this.page.id,
        //         title: this.story.title,
        //         summary: this.summary,
        //         uid: this.uid,
        //         userDisplayName: this.userDisplayName,
        //         previewImageUrl: imageDoc.data().previewUrl,
        //         imageFilenameOid: imageDoc.id,
        //         created: Date.now(),
        //         keywords: keywords,
        //         authorTags: authorTags,
        //         invite: isInvite
        //       }
        //       return publishPage(preview)
        //     } else {
        //       // possible if the server function hasn't run yet
        //       log('Image Document not found in DB at this time')
        //       return Promise.reject(
        //         new Error('There was an error finding image reference')
        //       )
        //     }
        //   })
        //   .then(() => {
        //     this.$emit('published', isInvite)
        //     this.closeDialog()
        //     this.$toast.success('Story published')
        //   })
        //   .catch(error => {
        //     log('There was an error publishing page', error)
        //     this.$toast.error(error.message)
        //   })
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
