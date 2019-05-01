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
          color="pink"
          dark
        >
          <v-toolbar-title>Publish Page</v-toolbar-title>
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
                  v-model="summary"
                  auto-grow
                  box
                  color="pink"
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
            @click="publish"
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
import { findImageByOid } from '~/api/service/image'
import { publishPage } from '~/api/service/page'

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
    }
  },
  data() {
    return {
      summary: '',
      summaryDialog: false,
      form: false
    }
  },
  computed: {
    ...mapGetters('story', ['story'])
  },
  created: function() {},
  methods: {
    findImageFilenameKey() {
      if (this.page.image && this.page.image.filename) {
        const filenameKey = this.page.image.filename.split('.').shift()
        return findImageByOid(filenameKey)
      } else {
        return Promise.reject(new Error('Image reference can not be found'))
      }
    },
    publish() {
      let keywords = []
      let authorTags = []

      log('publish page:', this.summary)
      keywords = stringUtils.findKeywords(this.summary)
      authorTags = stringUtils.findAuthorTags(this.summary)

      this.findImageFilenameKey()
        .then(imageDoc => {
          if (imageDoc.exists) {
            const preview = {
              storyOid: this.story.id,
              chapterOid: this.page.chapterOid,
              pageOid: this.page.id,
              title: this.story.title,
              summary: this.summary,
              uid: this.uid,
              userDisplayName: this.userDisplayName,
              previewImageUrl: imageDoc.data().previewUrl,
              imageFilenameOid: imageDoc.id,
              created: Date.now(),
              keywords: keywords,
              authorTags: authorTags
            }
            return publishPage(preview)
          } else {
            // possible if the server function hasn't run yet
            log('Image Document not found in DB at this time')
            return Promise.reject(
              new Error('There was an error finding image reference')
            )
          }
        })
        .then(() => {
          this.$emit('published')
          this.closeDialog()
          this.$toast.success('Story published')
        })
        .catch(error => {
          log('There was an error publishing page', error)
          this.$toast.error(error.message)
        })
    },
    closeDialog() {
      this.$emit('close')
    }
  }
}
</script>
