<template>
  <v-container grid-list-xl>
    <v-alert
      :color="alert.colour"
      icon="check_circle"
      v-model="alert.show"
      dismissible>
      {{ alert.message }}
    </v-alert>
    <v-layout v-if="story.id">
      <v-flex xs12>
        <v-tabs
          dark
          grow
          icons>
          <v-toolbar
            color="cyan"
            dark>
            <div>
              <h3 class="headline mb-0">{{ story.data.title }}</h3>
              <div v-show="authorUser.displayName">{{ authorUser.displayName }}</div>
              <div v-if="!authorUser.displayName">author</div>
            </div>
            <v-tabs-bar
              class="cyan"
              slot="extension">
              <v-tabs-slider color="yellow" />
              <v-tabs-item
                href="#summary-tab"
                v-show="story.data.summary">
                <v-icon>mdi mdi-book-open</v-icon>
                Summary
              </v-tabs-item>
              <v-tabs-item href="#writing-tab">
                <v-icon>mdi mdi-book-open-page-variant</v-icon>
                Writing
              </v-tabs-item>
              <v-tabs-item
                href="#picture-tab"
                v-if="page.data.image.ref">
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
            <v-tabs-content
              :id="'summary-tab'"
              v-show="story.data.summary">
              <v-card flat>
                <v-card-text>
                  <h6>{{ story.data.summary }}</h6>
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'writing-tab'">
              <v-card flat>
                <v-card-text>
                  temp text
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content
              :id="'picture-tab'"
              v-if="page.data.image.ref">
              <v-card flat>
                <v-card-text>
                  <div class="text-xs-center">
                    <img
                      class="card-img-top img-fluid"
                      :src="page.data.image.ref"
                      alt="no image">
                  </div>
                </v-card-text>
              </v-card>
            </v-tabs-content>
            <v-tabs-content :id="'sound-tab'">
              <v-card flat>
                temp text
              </v-card>
            </v-tabs-content>
          </v-tabs-items>
        </v-tabs>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import firebaseApp from '~/firebaseApp'

const db = firebaseApp.firestore()

export default {
  layout: 'story',
  data () {
    return {
      alert: {
        show: false,
        message: '',
        colour: 'success'
      },
      drawer: true,
      authorUser: '',
      story: {
        id: null,
        data: {
          summary: null
        }
      },
      chapter: {
        id: null,
        data: {
          number: null
        }
      },
      page: {
        id: null,
        data: {
          number: null,
          image: {
            ref: null
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  mounted: function () {
    this.$nextTick(function () {
      console.log('[Story Detail] - in mounted, page id:', this.$route.params.id)
      this.loadPage(this.$route.params.id)
    })
  },
  methods: {
    ...mapActions([
      'saveStory'
    ]),
    loadPage (pageOid) {
      let docRef = db.collection('pages').doc(pageOid)
      docRef.get().then(function (doc) {
        if (doc.exists) {
          this.page.id = pageOid
          this.page.data = doc.data()
          if (this.isAuthorised()) {
            this.initAuthorUser(this.page.data.uid)
            this.initStory(this.page.data.storyOid)
            this.initChapter(this.page.data.chapterOid)
          } else {
            this.raiseAlert('error', 'User not authorised to view this page')
          }
        } else {
          this.raiseAlert('error', 'Page does not exist')
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
          this.story.id = storyDoc.id
          this.story.data = storyDoc.data()
          this.saveStory(this.story)
          this.publishStoryOid(this.story.id)
          console.log('story.....', this.story)
        } else {
          this.raiseAlert('error', 'Story does not exist')
        }
      }.bind(this))
    },
    initChapter (chapterOid) {
      let chapterDocRef = db.collection('chapters').doc(chapterOid)

      chapterDocRef.get().then(function (chapterDoc) {
        if (chapterDoc.exists) {
          this.chapter.id = chapterDoc.id
          this.chapter.data = chapterDoc.data()
          console.log('chapter.....', this.chapter)
        } else {
          this.raiseAlert('error', 'Chapter does not exist')
        }
      }.bind(this))
    },
    isAuthorised () {
      return this.page.data.public || this.page.data.uid === this.user.uid
    },
    raiseAlert (severity, message) {
      this.alert.show = true
      this.alert.colour = severity
      this.alert.message = message
    },
    publishStoryOid (storyOid) {
      console.log('publishing story')
      EventBus.$emit('storyOidEvent', storyOid)
    }
  }
}
</script>
<style>
img {
  max-width: 500px;
}
</style>
