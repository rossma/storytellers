<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex d-flex xs12 sm6 md4 v-for="(preview, key, index) in previews" :key="preview.id" >
        <v-card>
          <v-card-title primary class="title">Key: {{ key }}</v-card-title>
          <img class="card-img-top img-fluid" :src="preview.data().coverRef" alt="no image">
          <v-card-text>author: {{ preview.data().userDisplayName }}</v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import firebaseApp from '~/firebaseApp'

  const db = firebaseApp.firestore()

  export default {
    data () {
      return {
        previews: []
      }
    },
    mounted: function () {
      this.readContent()
    },
    methods: {
      readContent () {
        console.log('user:', firebaseApp.auth().currentUser.displayName)
        db.collection('previews').get().then(function (querySnapshot) {
          this.previews = querySnapshot.docs
        }.bind(this))
        // db.collection('previews').get().then(function (querySnapshot) {
        //   querySnapshot.forEach((doc) => {
        //     console.log(`Doc: ${doc.id} => ${JSON.stringify(doc.data())}`)
        //   })
        //   this.previews = querySnapshot.docs
        // }.bind(this))
      }
    }
  }
</script>