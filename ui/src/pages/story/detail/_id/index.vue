<template>
  <v-container grid-list-xl>
    <v-alert :color="alert.colour" icon="check_circle" v-model="alert.show" dismissible>
      {{ alert.message }}
    </v-alert>
    <v-layout v-if="preview">
      <v-flex xs12>
        <v-tabs dark grow icons>
          <v-toolbar color="cyan" dark>
            <div>
              <h3 class="headline mb-0">{{ preview.title }}</h3>
              <div v-show="authorUser.displayName">{{ authorUser.displayName }}</div>
              <div v-if="!authorUser.displayName">author</div>
            </div>
            <v-tabs-bar class="cyan" slot="extension">
              <v-tabs-slider color="yellow"></v-tabs-slider>
              <v-tabs-item href="#summary-tab" v-show="story.summary">
                <v-icon>mdi mdi-book-open</v-icon>
                Summary
              </v-tabs-item>
              <v-tabs-item href="#writing-tab">
                <v-icon>mdi mdi-book-open-page-variant</v-icon>
                Writing
              </v-tabs-item>
              <v-tabs-item href="#picture-tab" v-if="page.image.ref">
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
            <v-tabs-content :id="'summary-tab'" v-show="story.summary">
              <v-card flat>
                <v-card-text>
                  <h6>{{ story.summary }}</h6>
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'writing-tab'">
              <v-card flat>
                <v-card-text>

                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'picture-tab'" v-if="page.image.ref">
              <v-card flat>
                <v-card-text>
                  <div class="text-xs-center">
                    <img class="card-img-top img-fluid" :src="page.image.ref" alt="no image">
                  </div>
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'sound-tab'">
              <v-card flat>

              </v-card>
            </v-tabs-content>
          </v-tabs-items>
        </v-tabs>
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
        preview: '',
        authorUser: '',
        story: {
          summary: null
        },
        page: {
          image: {
            ref: null
          }
        }
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
            this.initAuthorUser(this.preview.uid)
            this.initStory(this.preview.storyOid)
          } else {
            this.raiseAlert('error', 'Preview does not exist')
          }
        }.bind(this))
      },
      initAuthorUser (userOid) {
        let userDocRef = db.collection('users').doc(userOid)

        userDocRef.get().then(function (userDoc) {
          if (userDoc.exists) {
            this.authorUser = userDoc.data()
            console.log('author.....', this.authorUser)
          } else {
            this.raiseAlert('error', 'Author does not exist')
          }
        }.bind(this))
      },
      initStory (storyOid) {
        let storyDocRef = db.collection('stories').doc(storyOid)

        storyDocRef.get().then(function (storyDoc) {
          if (storyDoc.exists) {
            this.story = storyDoc.data()
            console.log('story.....', this.story)
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
<style>
  img {
    max-width: 500px;
  }
</style>