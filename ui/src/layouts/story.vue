<template>
  <v-app
    toolbar
    footer
    dark>
    <navigation-toolbar>
      <v-divider
        slot="nav-drawer"
        light />
      <v-list
        slot="nav-drawer"
        dense>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title v-if="story.data">{{ story.data.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-divider
        slot="nav-drawer"
        light />
      <v-list
        slot="nav-drawer"
        dense
        class="grey darken-3">
        <template>
          <div
            v-for="chapter in chapters"
            :key="chapter.id">
            <v-layout
              row
              align-center>
              <v-flex xs6>
                <v-subheader v-if="chapter.data.name">
                  {{ chapter.data.name }}
                </v-subheader>
                <v-subheader v-else>
                  {{ chapter.data.chapter }}
                </v-subheader>
              </v-flex>
              <v-flex
                xs6
                class="text-xs-right">
                <v-btn
                  small
                  flat>edit</v-btn>
              </v-flex>
            </v-layout>
            <v-list-tile
              v-for="page in chapterPages(chapter.id)"
              :key="page.id">
              <v-list-tile-action>
                x
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title class="grey--text">
                  {{ page.data.page }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-action>
                <v-icon>add</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title class="grey--text">
                  Add page
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider
              slot="nav-drawer"
              light/>
          </div>
        </template>
        <v-layout
          row
          align-center>
          <v-flex xs6>
            <v-icon>add</v-icon>
            Add chapter
          </v-flex>
        </v-layout>
      </v-list>
    </navigation-toolbar>
    <main>
      <v-content>
        <nuxt/>
      </v-content>
    </main>
    <page-footer/>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import PageFooter from '~/components/layout/PageFooter'
import NavigationToolbar from '~/components/layout/NavigationToolbar'
import firebaseApp from '~/firebaseApp'

const db = firebaseApp.firestore()

export default {
  middleware: 'authenticated',
  components: {
    NavigationToolbar,
    PageFooter
  },
  data () {
    return {
      chapters: [],
      pages: []
    }
  },
  computed: {
    ...mapGetters([
      'story'
    ])
  },
  mounted: function () {
    this.$nextTick(function () {
      console.log('[Story Nav] - in mounted, story id:', this.$route.params.id)
      EventBus.$on('storyOidEvent', storyOid => {
        console.log(`[story layout] storyOidEvent received payload:[${storyOid}]`)
        this.loadChapters(storyOid)
      })
    })
  },
  beforeDestroy () {
    EventBus.$off('storyOidEvent')
  },
  methods: {
    loadChapters (storyOid) {
      let self = this
      console.log('loading chapters for story', storyOid)
      let chaptersRef = db.collection('chapters').where('storyOid', '==', storyOid)
      chaptersRef.get().then(function (querySnapshot) {
        self.chapters = querySnapshot.docs.map((m) => {
          let chapter = {
            id: m.id,
            data: m.data()
          }
          console.log('Chapter:', chapter)
          return chapter
        })
      }).then(() => {
        console.log('Found Chapters:', self.chapters)
        let pagesRef = db.collection('pages').where('storyOid', '==', storyOid)
        pagesRef.get().then(function (querySnapshot) {
          self.pages = querySnapshot.docs.map((m) => {
            let page = {
              id: m.id,
              data: m.data()
            }
            console.log('Page:', page)
            return page
          })
        })
      })
    },
    chapterPages (chapterOid) {
      console.log('filtering pages by chapteroid:', chapterOid)
      return this.pages.filter(p => p.data.chapterOid === chapterOid)
    }
  }
}
</script>
