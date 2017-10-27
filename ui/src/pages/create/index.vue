<template>
  <v-container grid-list-xl>
    <v-layout>
      <v-flex>
        <v-card>
          <v-card-title primary class="title">Upload File</v-card-title>
          <v-card-text>
            <p>Select a file below. When it is uploaded, a link will be displayed to the uploaded file.</p>
            <upload-button title="Browse" :selectedCallback="processFile"></upload-button>
            File URL:
            <span id="linkbox">{{ fileUrl }}</span>
          </v-card-text>
        </v-card>
        <v-card v-show="fileUrl">
          <v-card-title primary class="title">Uploaded File</v-card-title>
          <v-card-text>
            <img class="card-img-top img-fluid" :src="fileUrl" alt="Card image cap">
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import UploadButton from '~/components/UploadButton'
  import firebaseApp from '~/firebaseApp'

  const db = firebaseApp.firestore()

  export default {
    components: {
      UploadButton
    },
    data () {
      return {
        fileUrl: ''
      }
    },
    methods: {
      processFile (file) {
        var metadata = {
          'contentType': file.type
        }
        var storageRef = firebaseApp.storage().ref()
        // Push to child path.
        // [START oncomplete]
        storageRef.child('images/' + file.name).put(file, metadata).then(function (snapshot) {
          console.log('ffff', this.$data.fileUrl)
          console.log('Uploaded', snapshot.totalBytes, 'bytes.')
          console.log('Metadata:', snapshot.metadata)
          console.log('downloadURL:', snapshot.downloadURL)
          this.fileUrl = snapshot.downloadURL
          // var url = snapshot.downloadURL;
          // console.log('File available at', url);
          // [START_EXCLUDE]
          // document.getElementById('linkbox').innerHTML = '<a href="' +  url + '">Click For File</a>';
          // [END_EXCLUDE]
          this.writeContentData(6, 'user1', snapshot.downloadURL)
        }.bind(this)).catch(function (error) {
          // [START onfailure]
          console.error('Upload failed:', error)
          // [END onfailure]
        })
      },
      writeContentData (id, userId, imageUrl) {
        db.collection('previews').add({
          owner: userId,
          type: 'img',
          ref: imageUrl
        })
          .then(function (docRef) {
            console.log('Document written with ID: ', docRef.id)
          })
          .catch(function (error) {
            console.error('Error adding document: ', error)
          })
      }
    }
  }
</script>