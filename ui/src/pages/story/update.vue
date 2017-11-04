<template>
  <v-container fluid grid-list-xl>
    <v-alert color="success" icon="check_circle" v-model="alert.show" dismissible>
      {{ alert.message }}
    </v-alert>
    <v-layout row wrap>
      <v-flex>
        <v-card>
          <v-card-title primary class="title">{{ story.title }}</v-card-title>
          <v-card-text>
           {{ story.summary }}
          </v-card-text>
        </v-card>
        <v-tabs dark fixed icons centered>
          <v-tabs-bar class="cyan">
            <v-tabs-slider color="yellow"></v-tabs-slider>
            <v-tabs-item href="#tab-1">
              <v-icon>mdi mdi-book-open-page-variant</v-icon>
              Writing
            </v-tabs-item>
            <v-tabs-item href="#tab-2">
              <v-icon>mdi mdi-palette</v-icon>
              Picture
            </v-tabs-item>
            <v-tabs-item href="#tab-3">
              <v-icon>mdi mdi-music-box</v-icon>
              Sound
            </v-tabs-item>
          </v-tabs-bar>
          <v-tabs-items>
            <v-tabs-content :id="'tab-1'">
              <v-card flat>
                <v-card-text>
                  <upload-button name="Upload" icon="mdi mdi-upload" :selectedCallback="processFileWords"></upload-button>
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'tab-2'">
              <v-card flat>
                <v-card-text>
                  <upload-button name="Upload" icon="mdi mdi-palette" :selectedCallback="processFileImage"></upload-button>
                    <v-container fluid>
                      <v-layout row>
                        <v-flex xs12>
                          <img class="card-img-top img-fluid" :src="imageFileUrl" />
                        </v-flex>
                      </v-layout>
                    </v-container>
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'tab-3'">
              <v-card flat>
                <upload-button name="Upload" icon="mdi mdi-music-box" :selectedCallback="processFileImage"></upload-button>
              </v-card>
            </v-tabs-content>
          </v-tabs-items>
        </v-tabs>
        <v-btn @click="publish">publish</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import UploadButton from '~/components/UploadButton'
  import firebaseApp from '~/firebaseApp'

  const db = firebaseApp.firestore()

  export default {
    components: {
      UploadButton
    },
    computed: {
      ...mapGetters(['story'])
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
        chapter: 1,
        page: 1
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
        console.log('ImageURL:', this.imageFileUrl)
        db.collection('stories/' + storyId + '/chapters/' + this.chapter + '/pages').doc(this.page.toString()).set({
          image: {
            ref: imageUrl,
            created: Date.now()
          },
          public: false
        })
      },
      publish () {
        console.log('publishing story')
        let previewUrl = ''
        db.collection('stories/' + this.story.id + '/chapters/' + this.chapter + '/pages/').doc(this.page.toString()).set({
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
            return db.collection('previews').add({
              storyOid: this.story.id,
              chapter: this.chapter,
              page: this.page,
              title: this.story.title,
              uid: firebaseApp.auth().currentUser.uid,
              userDisplayName: firebaseApp.auth().currentUser.displayName,
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