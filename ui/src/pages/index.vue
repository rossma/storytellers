<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex d-flex xs12 sm6 md4 v-for="(preview, key, index) in previews" >
        <v-card>
          <v-card-title primary class="title">Key: {{ key }}</v-card-title>
          <img class="card-img-top img-fluid" :src="preview.ref" alt="Card image cap">
          <v-card-text>Owner: {{ preview.owner }}</v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import firebaseApp from '~/firebaseApp'

  const database = firebaseApp.database()

  export default {
    data () {
      return {
        previews: []
      }
    },
    mounted: function () {
      // var database = firebaseApp.database()
      this.readContent()
    },
    methods: {
      readContent () {
        var previewsRef = database.ref('previews')
        previewsRef.on('value', function (snapshot) {
          this.previews = snapshot.val()
        }.bind(this))
      }
    }
  }
</script>