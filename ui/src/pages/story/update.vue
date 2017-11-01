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
        <v-card>
          <v-container fill-height fluid>
            <v-layout fill-height>
              <v-flex xs12 align-end flexbox>
                <upload-button icon="mdi mdi-book-open-page-variant" tooltip="Upload Words" :selectedCallback="processFileWords"></upload-button>
                <upload-button icon="mdi mdi-file-image" tooltip="Upload Image" :selectedCallback="processFileImage"></upload-button>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
        <v-card>
          <v-container fill-height fluid>
            <v-layout fill-height>
              <v-flex xs12 align-end flexbox>
                <v-card-text>
                  <v-subheader>Preview Panel</v-subheader>
                  <v-container fluid>
                    <v-layout row>
                      <v-flex xs12>
                        <img class="card-img-top img-fluid" :src="fileImageUrl" />
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
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
        fileImageUrl: '',
        chapter: 1,
        page: 1,
        imageRef: null
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
        storageRef.child('images/' + file.name).put(file, metadata).then(function (snapshot) {
          console.log('Uploaded', snapshot.totalBytes, 'bytes.')
          console.log('Metadata:', snapshot.metadata)
          console.log('downloadURL:', snapshot.downloadURL)
          this.fileImageUrl = snapshot.downloadURL
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
        this.imageRef = imageUrl
        db.collection('stories/' + storyId + '/chapters/' + this.chapter + '/pages').doc(this.page.toString()).set({
          imageRef: imageUrl,
          type: 'img',
          created: Date.now(),
          public: false
        })
      },
      publish () {
        console.log('publishing story')
        db.collection('stories/' + this.story.id + '/chapters/' + this.chapter + '/pages/').doc(this.page.toString()).set({
          public: true
        }, { merge: true })

        db.collection('previews').add({
          storyOid: this.story.id,
          chapter: this.chapter,
          page: this.page,
          title: this.story.title,
          uid: firebaseApp.auth().currentUser.uid,
          userDisplayName: firebaseApp.auth().currentUser.displayName,
          coverRef: this.imageRef
        })
          .then(function (docRef) {
            console.log('story published')
            this.alert.show = true
            this.alert.message = 'Story published'
          }.bind(this))
      }
    }
  }
</script>