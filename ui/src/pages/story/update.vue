<template>
  <v-container fluid grid-list-xl>
    <v-alert color="success" icon="check_circle" v-model="alert.show" dismissible>
      {{ alert.message }}
    </v-alert>
    <v-layout>
      <v-flex xs12>
        <v-tabs dark grow icons>
          <v-toolbar color="cyan" dark>
            <div>
              <h3 class="headline mb-0">{{ story.title }}</h3>
              <div v-show="user.data.displayName">{{ user.data.displayName }}</div>
              <div v-if="!user.data.displayName">display name not set</div>
            </div>
            <v-tabs-bar class="cyan" slot="extension">
              <v-tabs-slider color="yellow"></v-tabs-slider>
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
            <v-tabs-content :id="'writing-tab'">
              <v-card flat>
                <v-card-text>
                  <upload-button name="Upload" icon="mdi mdi-upload" :selectedCallback="processFileWords"></upload-button>
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'picture-tab'">
              <v-card flat>
                <v-card-text>
                  <upload-button name="Upload" icon="mdi mdi-palette" :selectedCallback="processFileImage"></upload-button>
                  <div class="text-xs-center">
                    <img class="card-img-top img-fluid" :src="imageFileUrl" alt="no image"/>
                  </div>
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'sound-tab'">
              <v-card flat>
                <upload-button name="Upload" icon="mdi mdi-music-box" :selectedCallback="processFileImage"></upload-button>
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
  import firebaseApp from '~/firebaseApp'
  import stringUtils from '~/utils/string'

  const db = firebaseApp.firestore()

  export default {
    layout: 'story',
    components: {
      UploadButton
    },
    computed: {
      ...mapGetters(['story', 'user'])
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
    mounted: function () {
      this.$nextTick(function () {
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
        var storageRef = firebaseApp.storage().ref()
        // Push to child path.
        // [START oncomplete]
        this.imageFilenameKey = this.uuidv4()
        storageRef.child('images/original/' + this.imageFilenameKey + '.' + file.name.split('.').pop())
          .put(file, metadata).then(function (snapshot) {
            console.log('Uploaded', snapshot.totalBytes, 'bytes.')
            console.log('Metadata:', snapshot.metadata)
            console.log('downloadURL:', snapshot.downloadURL)
            // var url = snapshot.downloadURL;
            // console.log('File available at', url);
            // [START_EXCLUDE]
            // document.getElementById('linkbox').innerHTML = '<a href="' +  url + '">Click For File</a>';
            // [END_EXCLUDE]
            this.writeContentData(this.story.id, snapshot.downloadURL)
          }.bind(this)).catch(function (error) {
            // [START onfailure]
            console.error('Upload failed:', error)
            // [END onfailure]
          })
      },
      writeContentData (storyId, imageUrl) {
        console.log('ImageURL:', imageUrl)
        this.imageFileUrl = imageUrl
        db.collection('chapters').add({
          chapter: this.chapter.number,
          name: this.chapter.name,
          uid: this.user.uid
        }).then(function (chapterDocRef) {
          console.log('Chapter Document written with ID: ', chapterDocRef.id)
          this.chapter.id = chapterDocRef.id
          db.collection('pages').add({
            storyOid: storyId,
            chapterOid: this.chapter.id,
            page: this.page.number,
            uid: this.user.uid,
            image: {
              ref: imageUrl,
              created: Date.now()
            },
            public: false
          }).then(function (pageDocRef) {
            console.log('Page Document written with ID: ', pageDocRef.id)
            this.page.id = pageDocRef.id
          }.bind(this)).catch(function (error) {
            console.error('Error adding page document: ', error)
            return Promise.reject(new Error('error adding Page Document to DB'))
          })
        }.bind(this)).catch(function (error) {
          console.error('Error adding document: ', error)
          return Promise.reject(new Error('error adding chapter Document to DB'))
        })
      },
      publish () {
        console.log('publishing story')
        let previewUrl = ''

        db.collection('/pages/').doc(this.page.id).set({
          public: true
        }, { merge: true })
          .then(() => {
            console.log('imageFilenameKey:', this.imageFilenameKey)
            return db.collection('images').doc(this.imageFilenameKey).get()
              .then(function (imageDoc) {
                if (imageDoc.exists) {
                  console.log('imageDoc:', imageDoc.data())
                  previewUrl = imageDoc.data().previewUrl
                } else {
                  console.log('Image Document not found in DB at this time')
                  // return Promise.reject(new Error('Image Document not found in DB'))
                }
              })
          })
          .then(() => {
            console.log('in previews update:', stringUtils.truncateWithEllipse(this.story.summary, 100))
            return db.collection('previews').add({
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
              .then(() => {
                console.log('story published')
                this.alert.show = true
                this.alert.message = 'Story published'
              })
          }).catch(function (err) {
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