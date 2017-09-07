<template>
  <div>
    <div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">
      <h2 class="mdl-card__title-text">Upload a file</h2>
    </div>
    <div class="mdl-card__supporting-text mdl-color-text--grey-600" id="messagesDiv">
      <p>Select a file below. When it is uploaded, a link will be displayed to the uploaded file.</p>
      <h6>Choose File</h6>
      <input type="file" id="file" name="file" @change="processFile($event)"/>
      <h6>File URL:</h6>
      <span id="linkbox">{{ fileUrl }}</span>
    </div>

    <div>
      {{ previews }}
    </div>
    <div class="card-columns">
      <div class="card" v-for="(preview, key, index) in previews">
        <img class="card-img-top img-fluid" :src="preview.ref" alt="Card image cap">
        <div class="card-block">
          <h4 class="card-title">Key: {{ key }}</h4>
          <p class="card-text">Owner: {{ preview.owner }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { firebaseApp } from '../firebaseApp'

  var database = firebaseApp.database()

  export default {
    data() {
      return {
        fileUrl: '',
        previews: []
      }
    },
    mounted: function () {
      console.log("mounted called")
     // var database = firebaseApp.database()
      this.readContent()
    },
    methods: {
      processFile(event) {
//        this.someData = event.target.files[0]

        event.stopPropagation()
        event.preventDefault()

        var file = event.target.files[0]

        var metadata = {
          'contentType': file.type
        }

        var storageRef = firebaseApp.storage().ref()
        // Push to child path.
        // [START oncomplete]
        storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
          console.log('ffff', this.$data.fileUrl)
          console.log('Uploaded', snapshot.totalBytes, 'bytes.')
          console.log('Metadata:', snapshot.metadata)
          console.log('downloadURL:', snapshot.downloadURL)
          this.fileUrl = snapshot.downloadURL
          //var url = snapshot.downloadURL;
          //console.log('File available at', url);
          // [START_EXCLUDE]
          //document.getElementById('linkbox').innerHTML = '<a href="' +  url + '">Click For File</a>';
          // [END_EXCLUDE]

          this.writeContentData(5, "user1", snapshot.downloadURL)

        }.bind(this)).catch(function(error) {
          // [START onfailure]
          console.error('Upload failed:', error);
          // [END onfailure]
        })
      },
      writeContentData(id, userId, imageUrl) {
        database.ref('previews/' + id).set({
          owner: userId,
          type: "img",
          ref: imageUrl
        })
      },
      readContent() {
        var previewsRef = database.ref('previews')
        previewsRef.on('value', function(snapshot) {
          this.previews = snapshot.val()
        }.bind(this))
      }
    }
  }
</script>

<style>
  /*.card {display:inline-block;}*/
</style>