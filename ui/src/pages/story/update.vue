<template>
  <v-container
    fluid
    grid-list-xl>
    <v-alert
      color="success"
      icon="check_circle"
      v-model="alert.show"
      dismissible>
      {{ alert.message }}
    </v-alert>
    <v-layout>
      <v-flex xs12>
        <v-tabs
          dark
          grow
          icons>
          <v-toolbar
            color="cyan"
            dark>
            <div>
              <h3 class="headline mb-0">{{ story.title }}</h3>
              <div v-show="user.data.displayName">{{ user.data.displayName }}</div>
              <div v-if="!user.data.displayName">display name not set</div>
            </div>
            <v-tabs-bar
              class="cyan"
              slot="extension">
              <v-tabs-slider color="yellow" />
              <v-tabs-item href="#summary-tab">
                <v-icon>mdi mdi-book-open</v-icon>
                Summary
              </v-tabs-item>
              <v-tabs-item href="#writing-tab">
                <v-icon>mdi mdi-book-open-page-variant</v-icon>
                Writing
              </v-tabs-item>
              <v-tabs-item href="#picture-tab">
                <v-icon>mdi mdi-palette</v-icon>
                Picture
              </v-tabs-item>
              <v-tabs-item href="#sound-tab">
                <v-icon>mdi mdi-music-box</v-icon>
                Sound
              </v-tabs-item>
            </v-tabs-bar>
          </v-toolbar>
          <v-tabs-items>
            <v-tabs-content :id="'summary-tab'">
              <v-card flat>
                <v-card-text>
                  <h6>{{ story.summary }}</h6>
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content
            :id="'writing-tab'">
              <v-card
              flat>
                <v-card-text>
                  <upload-button
                    name="Upload"
                    icon="mdi mdi-upload"
                    :selected-callback="processFileWords" />
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'picture-tab'">
              <v-card flat>
                <v-card-text>
                  <upload-button
                    name="Upload"
                    icon="mdi mdi-palette"
                    :selected-callback="processFileImage" />
                  <div class="text-xs-center">
                    <img
                      class="card-img-top img-fluid"
                      :src="imageFileUrl"
                      alt="no image">
                  </div>
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'sound-tab'">
              <v-card flat>
                <upload-button
                  name="Upload"
                  icon="mdi mdi-music-box"
                  :selected-callback="processFileImage"/>
              </v-card>
            </v-tabs-content>
          </v-tabs-items>
        </v-tabs>
      </v-flex>
    </v-layout>
    <v-btn @click="publish">publish</v-btn>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import UploadButton from '~/components/UploadButton'
import stringUtils from '~/utils/string'
import { addChapter } from '~/service/chapter'
import { addPage, updatePage } from '~/service/page'
import { uploadStoryImage, findImageByOid } from '~/service/image'
import { addPreview } from '~/service/preview'

export default {
  layout: 'story',
  components: {
    UploadButton
  },
  data () {
    return {
      alert: {
        show: false,
        message: ''
      },
      valid: true,
      imageFileUrl: '',
      imageFilenameKey: '',
      chapter: {
        id: null,
        number: 1,
        name: ''
      },
      page: {
        id: null,
        number: 1,
        public: false
      }
    }
  },
  computed: {
    ...mapGetters(['story', 'user'])
  },
  mounted: function () {
    this.$nextTick(() => {
      console.log('[Story/Update] - in mounted, story id:', this.story.id)
    })
  },
  methods: {
    processFileWords (file) {
      console.log('processing words')
    },
    processFileImage (file) {
      var metadata = {
        'contentType': file.type
      }
      this.imageFilenameKey = this.uuidv4()
      uploadStoryImage(file, metadata, this.imageFilenameKey).then((downloadUrl) => {
        this.writeContentData(this.story.id, downloadUrl)
      }).catch((err) => {
        console.log('Upload failed:', err)
        // todo raise alert
      })
    },
    writeContentData (storyId, imageUrl) {
      console.log('ImageURL:', imageUrl)
      this.imageFileUrl = imageUrl
      addChapter({
        storyOid: this.story.id,
        chapter: this.chapter.number,
        name: this.chapter.name,
        uid: this.user.uid
      }).then((chapterDocRef) => {
        console.log('Chapter Document written with ID: ', chapterDocRef.id)
        this.chapter.id = chapterDocRef.id
        return addPage({
          storyOid: storyId,
          chapterOid: this.chapter.id,
          page: this.page.number,
          uid: this.user.uid,
          image: {
            ref: imageUrl,
            created: Date.now()
          },
          public: false
        })
      }).then((pageDocRef) => {
        console.log('Page Document written with ID: ', pageDocRef.id)
        this.page.id = pageDocRef.id
      }).catch((error) => {
        console.error('Error adding document: ', error)
        return Promise.reject(new Error('error adding Document to DB'))
      })
    },
    publish () {
      console.log('publishing story')
      updatePage({public: true}, { merge: true }).then((pageDoc) => {
        console.log('imageFilenameKey:', this.imageFilenameKey)
        return findImageByOid(this.imageFilenameKey)
      }).then((imageDoc) => {
        let previewUrl = ''
        if (imageDoc.exists) {
          console.log('imageDoc:', imageDoc.data())
          previewUrl = imageDoc.data().previewUrl
        } else {
          // possible if the server function hasn't run yet
          console.log('Image Document not found in DB at this time')
        }
        return addPreview({
          storyOid: this.story.id,
          chapterOid: this.chapter.id,
          pageOid: this.page.id,
          title: this.story.title,
          summary: stringUtils.truncateWithEllipse(this.story.summary, 100),
          uid: this.user.uid,
          userDisplayName: this.user.data.displayName,
          previewImageUrl: previewUrl,
          imageFilenameOid: this.imageFilenameKey
        })
      }).then(() => {
        console.log('story published')
        this.alert.show = true
        this.alert.message = 'Story published'
      }).catch((err) => {
        console.log('in error handler:', err)
      })
    },
    uuidv4 () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0
        var v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }
}
</script>
