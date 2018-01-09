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
      <v-btn
        @click.stop="deleteDialog = true"
        color="red"
        v-if="storyExists && editable">delete
      </v-btn>
      <v-btn
        @click="submit"
        :disabled="!valid"
        v-if="editable">save
      </v-btn>
    </v-form>
    <v-dialog
      v-model="deleteDialog"
      persistent
      max-width="290">
      <v-card>
        <v-card-title class="headline">Delete Story?</v-card-title>
        <v-card-text>Are you sure you want to delete this story?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            @click="deleteStory">Yes</v-btn>
          <v-btn
            color="darken-1"
            @click.native="deleteDialog = false">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { findPreviewsByStory, updatePreview } from '~/service/preview'
import { addStory, updateStory, deleteStory } from '~/service/story'
import { addChapter } from '~/service/chapter'
import { addPage } from '~/service/page'
import stringUtils from '~/utils/string'

export default {
  name: 'StoryDetail',
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
    ...mapGetters(['user'])
  },
  methods: {
    ...mapActions([
      'saveStory'
    ]),
    deleteStory () {
      console.log('Deleting story', this.mutableStory)
      this.deleteDialog = false
      deleteStory(this.mutableStory.id).then(() => {
        console.log('Story successfully deleted')
        this.$router.push('/user/profile')
      }).catch((error) => {
        this.$toast.error(`There was an error deleting story:${error.message}`)
      })
    },
    submit () {
      if (this.$refs.form.validate()) {
        console.log('Saving story:', this.mutableStory)
        if (this.mutableStory.id) {
          this.updateStory(this.mutableStory)
        } else {
          this.createStory(this.mutableStory)
        }
      } else {
        // todo implement form validation
        this.$toast.error('Form validation failed')
      }
    },
    createStory (story) {
      addStory({
        uid: this.user.uid,
        title: story.data.title,
        summary: story.data.summary,
        created: story.data.created
      }).then((storyDoc) => {
        console.log('Document written with ID: ', storyDoc.id)
        this.mutableStory.id = storyDoc.id
        this.saveStory(storyDoc)
        // create initial chapter and page
        return addChapter({
          storyOid: this.mutableStory.id,
          chapter: 1,
          uid: this.user.uid
        })
      }).then((chapterDocRef) => {
        console.log('Chapter Document written with ID: ', chapterDocRef.id)
        return addPage({
          storyOid: this.mutableStory.id,
          chapterOid: chapterDocRef.id,
          page: 1,
          uid: this.user.uid,
          public: false
        })
      }).then((pageDocRef) => {
        console.log('Page Document written with ID: ', pageDocRef.id)
        this.$router.push('/story/detail/' + pageDocRef.id)
      }).catch((error) => {
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
