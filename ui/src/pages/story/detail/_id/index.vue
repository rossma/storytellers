<template>
  <v-container grid-list-xl>
    <v-alert :color="alert.colour" icon="check_circle" v-model="alert.show" dismissible>
      {{ alert.message }}
    </v-alert>
    <v-layout>
      <v-flex>
        <v-card v-if="preview">
          <v-card-title primary class="title">{{ preview.title }}</v-card-title>
          <v-card-text>
            {{ preview }}
            <br/>
            {{ story }}
            <br/>
            {{ page }}
            <img class="card-img-top img-fluid" v-if="page" :src="page.imageRef" alt="no image">
          </v-card-text>
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
        alert: {
          show: false,
          message: '',
          colour: 'success'
        },
        preview: null,
        story: null,
        page: null
      }
    },
    mounted: function () {
      this.$nextTick(function () {
        console.log('[Story Detail] - in mounted, preview id:', this.$route.params.id)
        this.loadPreview(this.$route.params.id)
      })
    },
    methods: {
      loadPreview (previewOid) {
        console.log('in loadpreview', previewOid)
        let docRef = db.collection('previews').doc(previewOid)

        docRef.get().then(function (doc) {
          if (doc.exists) {
            this.preview = doc.data()
            this.initStory(this.preview.storyOid)
          } else {
            this.raiseAlert('error', 'Preview does not exist')
          }
        }.bind(this))
      },
      initStory (storyOid) {
        let storyDocRef = db.collection('stories').doc(storyOid)

        storyDocRef.get().then(function (storyDoc) {
          if (storyDoc.exists) {
            this.story = storyDoc.data()
            console.log('doc.....', this.story)
            let pageDocRef = storyDocRef.collection('chapters/' +
                this.preview.chapter.toString() + '/pages').doc(this.preview.page.toString())
            pageDocRef.get().then(function (pageDoc) {
              if (pageDoc.exists) {
                this.page = pageDoc.data()
              } else {
                this.raiseAlert('error', 'Page does not exist')
              }
            }.bind(this))
          } else {
            this.raiseAlert('error', 'Story does not exist')
          }
        }.bind(this))
      },
      raiseAlert (severity, message) {
        this.alert.show = true
        this.alert.colour = severity
        this.alert.message = message
      }
    }
  }
</script>