<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex d-flex xs12 sm6 md4 v-for="(preview, key, index) in previews" :key="preview.id" >
        <v-card>
          <v-card-title color="primary" class="title">Key: {{ key }}</v-card-title>
          <img class="card-img-top img-fluid preview-img" :src="preview.previewImageUrl" alt="no image"
               v-on:click="showDetail(preview.id)">
          <v-card-text>author: {{ preview.userDisplayName }}</v-card-text>
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
      this.$nextTick(function () {
        this.readContent()
      })
    },
    methods: {
      readContent () {
        db.collection('previews').get().then(function (querySnapshot) {
          this.previews = querySnapshot.docs.map((m) => m.data())
        }.bind(this))
      },
      showDetail (previewOid) {
        console.log('previewOid:', previewOid)
        this.$router.push('/story/detail/' + previewOid)
      }
    }
  }
</script>

<style>
  .preview-img {
    cursor: pointer;
  }

</style>