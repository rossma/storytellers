<template>
  <v-container grid-list-md>
    <v-layout
      row
      wrap>
      <v-flex
        d-flex
        xs12
        sm6
        md3
        class="pa-2"
        v-for="preview in previews"
        :key="preview.id" >
        <v-card class="preview-card">
          <div>
            <v-card-media
              class="preview-img"
              :src="preview.data.previewImageUrl"
              @click="showDetail(preview.data.pageOid)"
              height="300px"/>
            <v-card-title primary-title>
              <div>
                <div class="headline truncate">{{ preview.data.title }}</div>
                <span class="grey--text truncate">{{ preview.data.summary }}</span>
              </div>
            </v-card-title>
          </div>
          <v-card-actions
            v-show="showAction"
            class="black">
            <v-spacer />
            <v-btn icon>
              <v-icon>favorite</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon>bookmark</v-icon>
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
import { mapGetters } from 'vuex'

import firebaseApp from '~/firebaseApp'

const db = firebaseApp.firestore()

export default {
  name: 'PreviewList',
  props: {
    showAction: {
      type: Boolean,
      default: true
    },
    filterBy: {
      type: Object,
      default: function () {
        return {
          userProfile: null,
          byAuthorUid: null
        }
      }
    }
  },
  data () {
    return {
      previews: []
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  mounted: function () {
    this.$nextTick(function () {
      this.init()
    })
  },
  methods: {
    init () {
      if (this.filterBy.userProfile) {
        this.fetchUserProfileStories()
      } else {
        this.fetchPublicStories()
      }
    },
    fetchUserProfileStories () {
      console.log('UID:', this.user.uid)
      let pages = null
      // let pagesRef = db.collection('pages').where('uid', '==', this.user.uid).where('public', '==', false)
      let pagesRef = db.collection('pages').where('uid', '==', this.user.uid)
      pagesRef.get().then(function (querySnapshot) {
        pages = querySnapshot.docs.map((m) => {
          let page = {
            id: m.id,
            data: m.data()
          }
          return page
        })
      }).then(() => {
        if (pages.length > 0) {
          let stories = null
          let storiesRef = db.collection('stories').where('uid', '==', this.user.uid)
          storiesRef.get().then(function (querySnapshot) {
            stories = querySnapshot.docs.map((m) => {
              let story = {
                id: m.id,
                data: m.data()
              }
              console.log('story:', story)
              return story
            })
          }).then(() => {
            console.log('Found Stories:', stories)
            let chapters = null
            let chaptersRef = db.collection('chapters').where('uid', '==', this.user.uid)
            chaptersRef.get().then(function (querySnapshot) {
              chapters = querySnapshot.docs.map((m) => {
                let chapter = {
                  id: m.id,
                  data: m.data()
                }
                return chapter
              })
            }).then(() => {
              console.log('Found Chapters:', chapters)

              // initialise previews

              this.previews = pages.map((page) => {
                console.log('page:', page)
                let story = stories.find(x => x.id === page.data.storyOid)
                console.log('tmp:', story)

                let preview = {
                  data: {
                    chapterOid: page.data.chapterOid,
                    pageOid: page.id,
                    previewImageUrl: page.data.image.ref,
                    storyOid: page.data.storyOid,
                    summary: story.data.summary,
                    title: story.data.title,
                    uid: page.data.uid,
                    userDisplayName: this.user.data.displayName
                  }
                }
                console.log('preview:', preview)
                return preview
              })
              console.log('previews:', this.previews)
              console.log('previews:', JSON.stringify(this.previews))
            })
          })
        } else {
          console.log('There are no private pages for this user')
        }
      })
    },
    fetchPublicStories () {
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
    showDetail (pageOid) {
      console.log('previewOid:', pageOid)
      this.$router.push('/story/detail/' + pageOid)
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
