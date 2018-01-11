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
              align-center
              v-show="!editChapter">
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
                class="text-xs-right"
                v-show="isEditable()">
                <v-btn
                  small
                  flat
                  @click="editChapter = !editChapter">edit</v-btn>
              </v-flex>
            </v-layout>
            <v-layout
              row
              align-center
              v-show="editChapter">
              <v-flex xs6>
                <v-text-field
                  name="input-1-3"
                  label="Chapter"
                  single-line
                  v-if="chapter.data.name"
                  v-model="chapter.data.name"
                />
                <v-text-field
                  name="input-1-3"
                  label="Chapter"
                  single-line
                  v-else
                  v-model="chapter.data.chapter"
                />
              </v-flex>
              <v-flex
                xs6
                class="text-xs-right">
                <v-btn
                  small
                  flat
                  @click="saveChapter(chapter)">save</v-btn>
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
    <v-content>
      <nuxt/>
    </v-content>
    <page-footer/>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import PageFooter from '~/components/layout/PageFooter'
import NavigationToolbar from '~/components/layout/NavigationToolbar'
import { updateChapterName, findChaptersByStory } from '~/service/chapter'
import { findPagesByStory } from '~/service/page'

export default {
  middleware: 'authenticated',
  components: {
    NavigationToolbar,
    PageFooter
  },
  data () {
    return {
      chapters: [],
      editChapter: false,
      pages: [],
      story: {
        id: '',
        data: {
          uid: '',
          title: ''
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
    this.$nextTick(() => {
      EventBus.$on('storyEvent', story => {
        console.log(`[story layout] storyEvent received payload:[${story.id}]`)
        this.story = story
        this.loadChapters(story.id)
      })
    })
  },
  beforeDestroy () {
    EventBus.$off('storyEvent')
  },
  methods: {
    loadChapters (storyOid) {
      findChaptersByStory(storyOid).then((chapters) => {
        console.log('Found Chapters:', chapters)
        this.chapters = chapters
        return findPagesByStory(storyOid)
      }).then((pages) => {
        console.log('Found Pages:', pages)
        this.pages = pages
      })
    },
    chapterPages (chapterOid) {
      console.log('filtering pages by chapteroid:', chapterOid)
      return this.pages.filter(p => p.data.chapterOid === chapterOid)
    },
    saveChapter (chapter) {
      console.log('chapter:', chapter)
      if (!chapter.data.name) {
        chapter.data.name = chapter.data.chapter
      }
      console.log('Saving name:', chapter.data.name)
      updateChapterName(chapter.id, chapter.data.name)
      this.editChapter = !this.editChapter
    },
    isEditable () {
      return this.story.data.uid === this.user.uid
    }
  }
}
</script>
