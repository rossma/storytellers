<template>
  <base-page-publish
    v-model="basePagePublishModel"
    :dialog="dialog"
    :page="page"
    :theme="theme"
    :title="title"
    :uid="uid"
    :user-display-name="userDisplayName"
    @published="this.$emit('published', false)"
    @close="closeDialog()"
  >
    <template #form-custom-input="slotProps">
      <v-row>
        <v-col>
          <v-flex v-if="!isPublished">
            <v-tooltip top>
              <template #activator="{ on }">
                <v-switch
                  v-model="inviteSwitch"
                  label="Invite"
                  color="secondary"
                  v-on="on"
                />
              </template>
              <span>Invite others to collaborate</span>
            </v-tooltip>
          </v-flex>
        </v-col>
      </v-row>
    </template>
    <template #form-action-buttons="slotProps">
      <v-btn
        v-if="isPublished"
        color="secondary"
        @click="publishAndInvite()"
      >
        <v-icon float-left>
          mdi-launch
        </v-icon>
        Invite
      </v-btn>
      <v-btn
        v-if="!isPublished"
        color="primary"
        @click="publish()"
      >
        <v-icon float-left>
          mdi-launch
        </v-icon>
        Publish
      </v-btn>
    </template>
  </base-page-publish>
</template>
<script>
import debug from 'debug'

import { mapGetters } from 'vuex'

import BasePagePublish from '~/components/BasePagePublish'
import stringUtils from '~/utils/string'

import { publishPage } from '~/api/service/page'
// import { findImageByOid, uploadImage } from '~/api/service/image'
import { uploadImage } from '~/api/service/image'

const log = debug('app:components/PagePublish')

export default {
  name: 'PagePublish2',
  components: {
    BasePagePublish
  },
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
      basePagePublishModel: {
        background: {
          type: '',
          val: ''
        },
        font: {
          color: null
        },
        summary: ''
      },
      inviteSwitch: false
    }
  },
  computed: {
    ...mapGetters('story', ['story']),
    theme: function() {
      return this.isPublished ? 'secondary' : 'primary'
    },
    title: function() {
      return this.isPublished ? 'Invite Collaborators' : 'Publish Page'
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.init()
    })
  },
  created: function() {},
  methods: {
    init() {
      log('in init')
    },
    isQuotePage: function() {
      return this.page.quote && this.page.quote.src
    },
    uploadPreviewImage(uploadedPreviewImageFile) {
      if (uploadedPreviewImageFile) {
        return uploadImage(uploadedPreviewImageFile).then(result => {
          log('uploaded image:', result)

          uploadedPreviewImageFile = null

          const previewImageData = {
            filename: result.filename,
            ref: result.downloadUrl,
            created: Date.now()
          }

          return previewImageData
        })
      } else {
        log('selectedPreviewImageFile not set therefore not uploading')
        return Promise.resolve()
      }
    },
    // findImageFilenameKey() {
    //   if (this.page.image && this.page.image.filename) {
    //     const filenameKey = this.page.image.filename.split('.').shift()
    //     return findImageByOid(filenameKey)
    //   } else {
    //     return Promise.resolve()
    //   }
    // },
    publishAndInvite() {
      log('page already published just need to send invitation')
      this.inviteSwitch = true
      this.publish()
    },
    publish() {
      log('basePagePublishModel', this.basePagePublishModel)
      log('page:', this.page)

      if (this.basePagePublishModel && this.basePagePublishModel.summary) {
        if (this.isQuotePage()) {
          this.publishPagePreview({
            quote: {
              src: this.page.quote.src
            },
            background: {
              color: this.page.quote.background
            },
            font: {
              color: this.page.quote.color
            }
          })
        } else if (this.basePagePublishModel.background.type === 'page-image') {
          log('page image src:', this.basePagePublishModel.background.val)
          log('page image id:', this.basePagePublishModel.background.id)
          this.publishPagePreview({
            image: {
              url: this.basePagePublishModel.background.val,
              id: this.basePagePublishModel.background.id
            }
          })

          // this.findImageFilenameKey()
          //   .then(imageSnapshot => {
          //     if (imageSnapshot && imageSnapshot.exists) {
          //       // url should be same as : this.basePagePublishModel.background.val
          //       this.publishPagePreview({
          //         image: {
          //           url: imageSnapshot.data().previewUrl,
          //           id: imageSnapshot.id
          //         }
          //       })
          //     }
          //   })
          //   .catch(error => {
          //     log('There was an error publishing page', error)
          //     this.$toast.error(error.message)
          //   })

        } else if (
          this.basePagePublishModel.background.type === 'file-upload-image'
        ) {
          this.uploadPreviewImage(
            this.basePagePublishModel.background.file
          ).then(imageData => {
            log('uploaded preview image, imageData:', imageData)
            if (imageData) {
              this.publishPagePreview({
                image: {
                  url: imageData.ref,
                  id: imageData.filename
                }
              })
            } else {
              this.$toast.error('There was an error uploading preview image')
            }
          })
        } else if (this.basePagePublishModel.background.type === 'color') {
          this.publishPagePreview({
            background: {
              color: this.basePagePublishModel.background.val
            },
            font: {
              color: this.basePagePublishModel.font ? this.basePagePublishModel.font.color : null
            }
          })
        } else if (this.basePagePublishModel.background.type === 'wallpaper') {
          this.publishPagePreview({
            wallpaper: {
              url: this.basePagePublishModel.background.val
            }
          })
        }
      } else {
        this.$toast.error(
          'Please enter a short summary of your page you are going to publish'
        )
      }
    },
    publishPagePreview(previewData) {
      log('in publish page preview, previewData:', previewData)
      let keywords = []
      let authorTags = []
      log('inviteSwitch', this.inviteSwitch)

      log('publish page:', this.basePagePublishModel.summary)
      keywords = stringUtils.findKeywords(this.basePagePublishModel.summary)
      authorTags = stringUtils.findAuthorTags(this.basePagePublishModel.summary)

      const preview = {
        storyOid: this.story.id,
        chapterOid: this.page.chapterOid,
        pageOid: this.page.id,
        title: this.story.title,
        quote: previewData.quote ? previewData.quote.src : '',
        fontColor: previewData.font ? previewData.font.color : '#FFFFFF',
        summary: this.basePagePublishModel.summary,
        uid: this.uid,
        userDisplayName: this.userDisplayName,
        backgroundColor:
          previewData.background && previewData.background.color
            ? previewData.background.color
            : '#000000',
        previewImageUrl:
          previewData.image && previewData.image.url
            ? previewData.image.url
            : '',
        imageFilenameOid:
          previewData.image && previewData.image.id ? previewData.image.id : '',
        created: Date.now(),
        keywords: keywords.map(keyword => keyword.toLowerCase()),
        authorTags: authorTags,
        invite: this.inviteSwitch,
        wallpaperUrl:
          previewData.wallpaper && previewData.wallpaper.url
            ? previewData.wallpaper.url
            : ''
      }

      log('publishing page with preview:', preview)
      publishPage(preview)
        .then(() => {
          this.$emit('published', false)
          this.closeDialog()
          this.$toast.success('Story published')
          // todo ... redirecting here so do we need above steps?
          this.$router.push(`/user/${this.uid}`)
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
<style>
</style>
