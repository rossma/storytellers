<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex d-flex xs12 sm6 md3 class="pa-2" v-for="(preview, key, index) in previews" :key="preview.id" >
        <v-card class="preview-card">
          <div>
            <v-card-media class="preview-img" :src="preview.data.previewImageUrl" v-on:click="showDetail(preview.id)"
                          height="300px">
            </v-card-media>
            <v-card-title primary-title>
              <div>
                <div class="headline truncate">{{ preview.data.title }}</div>
                <span class="grey--text truncate">{{ preview.data.summary }}</span>
              </div>
            </v-card-title>
          </div>
          <v-card-actions class="black">
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>favorite</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon>share</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import firebaseApp from '~/firebaseApp'

  const db = firebaseApp.firestore()

  export default {
    name: 'preview-list',
    props: {
      filterBy: Object
    },
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
        let previewsRef = db.collection('previews')
        if (this.filterBy.byAuthorUid) {
          previewsRef = previewsRef.where('uid', '==', this.filterBy.byAuthorUid)
        }
        previewsRef.get().then(function (querySnapshot) {
          this.previews = querySnapshot.docs.map((m) => {
            let preview = {
              id: m.id,
              data: m.data()
            }
            return preview
          })
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

  .preview-card {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
  }

</style>