<template>
  <div>
    <v-form
      class="text-xs-right"
      v-model="valid"
      ref="form"
      lazy-validation>
      <v-card
        color="secondary"
        flat>
        <v-card-text>
          <v-container
            fluid
            v-if="editable">
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  label="Title"
                  v-model="mutableStory.data.title"
                  required/>
                <v-text-field
                  name="summary"
                  label="Summary"
                  textarea
                  v-model="mutableStory.data.summary"
                  dark/>
              </v-flex>
            </v-layout>
          </v-container>
          <div v-else>
            {{ mutableStory.data.summary }}
          </div>
        </v-card-text>
      </v-card>
      <v-tooltip top>
        <v-btn
          @click.stop="deleteDialog = true"
          color="red"
          v-if="storyExists && editable"
          slot="activator">delete
        </v-btn>
        <span>Delete Story</span>
      </v-tooltip>
      <v-tooltip top>
        <v-btn
          @click="submit"
          :disabled="!valid"
          v-if="editable"
          slot="activator">save
        </v-btn>
        <span>Save Story</span>
      </v-tooltip>
    </v-form>
    <story-summary-delete-dialog
      :story="mutableStory"
      :dialog="deleteDialog"
      @close="deleteDialog = false" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { findPreviewsByStory, updatePreview } from '~/api/service/preview'
import { addStory, updateStory } from '~/api/service/story'
import stringUtils from '~/utils/string'
import StorySummaryDeleteDialog from './StorySummaryDeleteDialog'

export default {
  name: 'StorySummary',
  components: {StorySummaryDeleteDialog},
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
          data: {
            title: '',
            summary: '',
            created: Date.now()
          }
        }
      }
    },
    storyExists: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      deleteDialog: false,
      mutableStory: this.story,
      valid: true
    }
  },
  computed: {
    ...mapGetters('modules/user', [
      'uid'
    ])
  },
  methods: {
    ...mapActions('modules/user', [
      'saveStory'
    ]),
    submit () {
      if (this.$refs.form.validate()) {
        console.log('Saving story:', this.mutableStory)
        if (this.mutableStory.id) {
          this.updateStory(this.mutableStory)
        } else {
          this.mutableStory.data.uid = this.uid
          this.createStory(this.mutableStory)
        }
      } else {
        // todo implement form validation
        this.$toast.error('Form validation failed')
      }
    },
    createStory (story) {
      let chapter = {
        chapter: 1,
        uid: story.data.uid
      }

      let page = {
        page: 1,
        uid: story.data.uid,
        public: false
      }

      addStory(story.data, chapter, page).then((result) => {
        story.id = result.storyOid
        this.mutableStory = story
        this.saveStory(story)
        this.$router.push(`/story/${result.pageOid}`)
      }).catch((error) => {
        console.log('Error adding story', error)
        this.$toast.error(`Error adding story:${error.message}`)
      })
    },
    updateStory (story) {
      updateStory(story.id, {
        title: story.data.title,
        summary: story.data.summary
      }).then((storyDoc) => {
        this.saveStory(storyDoc)
        this.$toast.success('Story updated')
        this.updatePreviews(story)
      }).catch((error) => {
        this.$toast.error(`Error updating story:${error.message}`)
      })
    },
    updatePreviews (story) {
      console.log('Updating preview from story:', story)
      let previews = []
      findPreviewsByStory(story.id).then((previewsSnapshot) => {
        previews = previewsSnapshot
      }).catch((error) => {
        console(`Error looking up previews for story:${story.id}`, error)
      })
      previews.forEach((preview) => {
        updatePreview(preview.id, {
          title: story.data.title,
          summary: stringUtils.truncateWithEllipse(story.data.summary, 100)
        })
      })
    }
  }
}
</script>
