<template>
  <div>
    <v-form
      ref="form"
      v-model="valid"
      class="text-xs-right"
      lazy-validation
    >
      <v-card flat>
        <v-card-text>
          <v-container
            v-if="editable"
            fluid
          >
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  v-model="mutableStory.title"
                  label="Title"
                  required
                />
                <v-textarea
                  v-model="mutableStory.summary"
                  name="summary"
                  label="Summary"
                  outline
                  dark
                />
              </v-flex>
            </v-layout>
          </v-container>
          <div v-else>
            {{ mutableStory.summary }}
          </div>
        </v-card-text>
      </v-card>
      <v-tooltip top>
        <v-btn
          v-if="storyExists && editable"
          slot="activator"
          color="red"
          @click.stop="deleteDialog = true"
        >
          delete
        </v-btn>
        <span>Delete Story</span>
      </v-tooltip>
      <v-tooltip top>
        <v-btn
          v-if="editable"
          slot="activator"
          :disabled="!valid"
          @click="submit"
        >
          save
        </v-btn>
        <span>Save Story</span>
      </v-tooltip>
    </v-form>
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
import stringUtils from '~/utils/string'
import StorySummaryDeleteDialog from './StorySummaryDeleteDialog'
import debug from 'debug'
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
          summary: ''
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
      currentPageOid: null,
      currentChapterOid: null,
      deleteDialog: false,
      mutableStory: {
        id: null,
        summary: null,
        title: null,
        uid: null
      },
      valid: true
    }
  },
  computed: {
    ...mapGetters('auth', ['uid'])
  },
  created: function() {
    this.mutableStory = {
      id: this.story.id,
      summary: this.story.summary,
      title: this.story.title,
      uid: this.story.uid
    }
  },
  methods: {
    ...mapActions('story', ['saveStory']),
    submit() {
      if (this.$refs.form.validate()) {
        log('Saving story:', this.mutableStory)
        if (this.mutableStory.id) {
          this.updateStory(this.mutableStory)
        } else {
          this.mutableStory.uid = this.uid
          this.mutableStory.created = Date.now()
          this.createStory(this.mutableStory)
        }
      } else {
        this.$toast.error('Form validation failed')
      }
    },
    createStory(mutableStory) {
      let story = {
        title: mutableStory.title,
        summary: mutableStory.summary,
        uid: mutableStory.uid,
        created: mutableStory.created
      }

      let chapter = {
        chapter: 1,
        uid: mutableStory.uid
      }

      let page = {
        page: 1,
        uid: mutableStory.uid,
        public: false
      }

      addStory(story, chapter, page)
        .then(result => {
          log('[StorySummary] Finished saving story, result', result)
          this.mutableStory.id = result.storyOid
          this.currentPageOid = result.pageOid
          this.currentChapterOid = result.chapterOid
          //this.mutableStory.activePage = result.pageOid
          this.saveStory(this.mutableStory)
          this.$router.push(`/story/${result.pageOid}`)
        })
        .catch(error => {
          log('Error adding story', error)
          this.$toast.error(`Error adding story:${error.message}`)
        })
    },
    updateStory(mutableStory) {
      let story = {
        title: mutableStory.title,
        summary: mutableStory.summary
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
          console(`Error looking up previews for story:${story.id}`, error)
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
