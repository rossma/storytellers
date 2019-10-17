<template>
  <div>
    <v-card
      class="mx-auto"
      flat
    >
      <v-container
        v-if="editable"
        class="pa-2"
        fluid
      >
        <v-form
          ref="form"
          v-model="valid"
          class="text-right"
          lazy-validation
        >
          <v-layout>
            <v-flex
              xs-4
            >
              <v-tooltip top>
                <template #activator="{ on }">
                  <div
                    class="jbtn-file"
                    v-on="on"
                  >
                    <v-img
                      :src="coverImageSrc"
                      aspect-ratio="0.5"
                      max-width="200"
                      max-height="200"
                      class="cover-image"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      @change="coverImageSelected"
                    >
                  </div>
                </template>
                <span>Upload Cover Image</span>
              </v-tooltip>
            </v-flex>
            <v-flex xs8>
              <v-text-field
                v-model="mutableStory.title"
                label="Title"
                required
              />
              <v-textarea
                v-model="mutableStory.summary"
                outlined
                name="summary"
                label="Summary"
                rows="10"
              />
            </v-flex>
          </v-layout>
          <v-card-actions>
            <v-spacer />
            <v-tooltip top>
              <template #activator="{ on }">
                <v-btn
                  v-if="storyExists"
                  color="negative"
                  class="mr-1"
                  v-on="on"
                  @click.stop="deleteDialog = true"
                >
                  <v-icon float-left>
                    mdi-delete
                  </v-icon>
                  delete
                </v-btn>
              </template>
              <span>Delete Story</span>
            </v-tooltip>
            <v-tooltip top>
              <template #activator="{ on }">
                <v-btn
                  :disabled="!valid"
                  class="primary"
                  v-on="on"
                  @click="submit"
                >
                  <v-icon float-left>
                    mdi-content-save-outline
                  </v-icon>
                  save
                </v-btn>
              </template>
              <span>Save Story</span>
            </v-tooltip>
          </v-card-actions>
        </v-form>
      </v-container>
      <v-container
        v-else
        fluid
      >
        <v-layout pl-2>
          <v-flex xs-4>
            <v-img
              :src="coverImageSrc"
              aspect-ratio="0.5"
              max-width="200"
              max-height="200"
              class="cover-image"
            />
          </v-flex>
          <v-flex xs-8>
            <v-card-text class="subtitle-1">
              {{ mutableStory.summary }}
            </v-card-text>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
    <story-summary-delete-dialog
      :story="mutableStory"
      :dialog="deleteDialog"
      @close="deleteDialog = false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { findPreviewsByStory, updatePreview } from '~/api/service/preview'
import { addStory, updateStory } from '~/api/service/story'
import { uploadImage } from '~/api/service/image'

import stringUtils from '~/utils/string'
import debug from 'debug'
import StorySummaryDeleteDialog from './StorySummaryDeleteDialog'
const log = debug('app:components/StorySummary')

export default {
  name: 'StorySummary',
  components: {
    StorySummaryDeleteDialog
  },
  props: {
    editable: {
      type: Boolean,
      default: false
    },
    story: {
      type: Object,
      default: () => {
        return {
          id: null,
          title: '',
          summary: '',
          cover: {
            ref: null
          }
        }
      }
    },
    storyExists: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      newCoverImageFile: null,
      coverImageClientUrl: null,
      currentPageOid: null,
      currentChapterOid: null,
      deleteDialog: false,
      mutableStory: {
        id: null,
        summary: null,
        title: null,
        uid: null,
        cover: {
          ref: null
        }
      },
      valid: true
    }
  },
  computed: {
    ...mapGetters('auth', ['uid']),
    coverImageSrc: function() {
      if (this.coverImageClientUrl) {
        return this.coverImageClientUrl
      } else if (this.mutableStory.cover.ref) {
        return this.mutableStory.cover.ref
      } else {
        return '/img/missing-image.png'
      }
    }
  },
  created: function() {
    this.mutableStory = {
      id: this.story.id,
      summary: this.story.summary,
      title: this.story.title,
      uid: this.story.uid,
      cover: {
        ref: this.story.cover.ref
      }
    }
  },
  methods: {
    ...mapActions('story', ['saveStory']),
    coverImageSelected(e) {
      const imageFile = e.target.files[0]
      const limit = 2000000
      if (imageFile) {
        if (imageFile.size > limit) {
          this.$toast.error(
            `The file is over the ${limit / 1000 / 1000}MB limit`
          )
        } else {
          this.newCoverImageFile = imageFile
          this.coverImageClientUrl = URL.createObjectURL(imageFile)
        }
      } else {
        this.$toast.error('No cover image selected')
      }
    },
    uploadCoverImage() {
      if (this.newCoverImageFile) {
        return uploadImage(this.newCoverImageFile).then(result => {
          log('uploaded image:', result)

          this.newCoverImageFile = null
          return result.downloadUrl
        })
      } else {
        return Promise.resolve(this.mutableStory.cover.ref || '')
      }
    },
    submit() {
      if (this.$refs.form.validate()) {
        log('Saving story:', this.mutableStory)

        this.uploadCoverImage().then(downloadUrl => {
          this.mutableStory.cover.ref = downloadUrl
          if (this.mutableStory.id) {
            this.updateStory(this.mutableStory)
          } else {
            this.mutableStory.uid = this.uid
            this.mutableStory.created = Date.now()
            this.createStory(this.mutableStory)
          }
        })
      } else {
        this.$toast.error('Form validation failed')
      }
    },
    createStory(mutableStory) {
      const story = {
        title: mutableStory.title,
        summary: mutableStory.summary,
        uid: mutableStory.uid,
        created: mutableStory.created,
        cover: {
          ref: mutableStory.cover.ref
        }
      }

      const chapter = {
        chapter: 1,
        uid: mutableStory.uid
      }

      const page = {
        page: 1,
        uid: mutableStory.uid,
        invite: false,
        public: false
      }

      addStory(story, chapter, page)
        .then(result => {
          log('[StorySummary] Finished saving story, result', result)
          this.mutableStory.id = result.storyOid
          this.currentPageOid = result.pageOid
          this.currentChapterOid = result.chapterOid
          // this.mutableStory.activePage = result.pageOid
          this.saveStory(this.mutableStory)
          this.$router.push(`/story/${result.pageOid}`)
        })
        .catch(error => {
          log('Error adding story', error)
          this.$toast.error(`Error adding story:${error.message}`)
        })
    },
    updateStory(mutableStory) {
      const story = {
        title: mutableStory.title,
        summary: mutableStory.summary,
        cover: {
          ref: mutableStory.cover.ref
        }
      }
      updateStory(mutableStory.id, story)
        .then(() => {
          this.saveStory(
            mutableStory,
            this.currentChapterOid,
            this.currentPageOid
          )
          this.updatePreviews(mutableStory)
          this.$toast.success('Story updated')
        })
        .catch(error => {
          log('Error updating story:', error)
          this.$toast.error(`Error updating story:${error.message}`)
        })
    },
    updatePreviews(story) {
      log('Updating preview from story:', story)
      let previews = []
      findPreviewsByStory(story.id)
        .then(previewsSnapshot => {
          previews = previewsSnapshot
        })
        .catch(error => {
          log(`Error looking up previews for story:${story.id}`, error)
          this.$toast.error(`Error updating preview:${error.message}`)
        })
      previews.forEach(preview => {
        updatePreview(preview.id, {
          title: story.title,
          summary: stringUtils.truncateWithEllipse(story.summary, 100)
        })
      })
    }
  }
}
</script>
<style>
.cover-image {
  /*max-height: 300px;*/
}
.jbtn-file {
  max-width: 200px;
  max-height: 200px;
}
</style>
