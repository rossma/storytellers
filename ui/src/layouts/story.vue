<!--suppress CssUnusedSymbol -->
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
          <v-list>
            <v-list-group
              v-for="(chapter, chapterIdx) in chapters"
              v-if="chapter"
              :value="chapter.active"
              :key="chapter.id">
              <v-list-tile
                class="chapter-tile"
                slot="item">
                <v-list-tile-content @click="enableChapterInput($event)">
                  <v-text-field
                    name="chapterNameTxt"
                    label="Chapter"
                    class="chapter-name-in-txt"
                    hide-details
                    single-line
                    :value="chapterDisplayName(chapter, chapterIdx)"
                    @blur="saveChapterName($event, chapter)"
                  />
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-icon>keyboard_arrow_down</v-icon>
                </v-list-tile-action>
              </v-list-tile>
              <v-list-tile
                v-for="(page, pageIdx) in chapterPages(chapter.id)"
                :key="page.id"
                :class="[page.active ? 'active-page': '', 'link-to-page']"
                @click="$router.push(`/story/detail/${page.id}`)">
                <v-list-tile-content>
                  <v-list-tile-title class="grey--text">
                    {{ chapter.data.chapter }}-{{ ++pageIdx }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-layout
                row
                align-center>
                <v-flex
                  class="add-page-btn"
                  xs12
                  @click="addNewPage(chapter.id)"
                >
                  <v-icon>add</v-icon>
                  <span class="ml-2">Page</span>
                </v-flex>
              </v-layout>
            </v-list-group>
          </v-list>
        </template>
        <v-layout
          row
          align-center>
          <v-flex
            class="add-chapter-btn"
            xs12
            @click="addNewChapter()"
          >
            <v-icon>add</v-icon>
            <span class="ml-2">Chapter</span>
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
import { mapGetters, mapActions } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import PageFooter from '~/components/layout/PageFooter'
import NavigationToolbar from '~/components/layout/NavigationToolbar'
import { addChapter, updateChapterName, findChaptersByStory } from '~/service/chapter'
import { addPage, findPagesByStory } from '~/service/page'

export default {
  middleware: 'authenticated',
  components: {
    NavigationToolbar,
    PageFooter
  },
  data () {
    return {
      chapters: [],
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
      'uid'
    ])
  },
  mounted: function () {
    this.$nextTick(() => {
      EventBus.$on('storyEvent', story => {
        console.log(`[Story Layout] storyEvent received payload:[${story.id}]`)
        this.story = story
        this.loadChapters(story)
      })
    })
  },
  beforeDestroy () {
    EventBus.$off('storyEvent')
  },
  methods: {
    ...mapActions([
      'savePages'
    ]),
    loadChapters (story) {
      findChaptersByStory(story.id).then((chapters) => {
        this.chapters = chapters.map(chapter => {
          chapter.active = (chapter.id === story.ext.activePage.data.chapterOid)
          return chapter
        }).sort((a, b) => a.data.chapter - b.data.chapter)
        return findPagesByStory(story.id)
      }).then((pages) => {
        this.pages = pages.map(page => {
          page.active = (page.id === story.ext.activePage.id)
          return page
        })
        this.savePages(pages)
      })
    },
    chapterPages (chapterOid) {
      console.log('filtering pages by chapterOid:', chapterOid)
      return this.pages.filter(p => p.data.chapterOid === chapterOid).sort((a, b) => a.data.page - b.data.page)
    },
    chapterDisplayName (chapter, index) {
      return chapter.data.name ? chapter.data.name : `Chapter ${++index}`
    },
    saveChapterName (event, chapter) {
      if (chapter.data.name !== event.target.value) {
        chapter.data.name = event.target.value
        updateChapterName(chapter.id, chapter.data.name)
      }
    },
    isEditable () {
      return this.story.data.uid === this.uid
    },
    addNewChapter () {
      console.log('Adding chapter')
      return addChapter({
        storyOid: this.story.id,
        chapter: ++this.chapters.pop().chapter,
        uid: this.uid
      }).then((chapterDocRef) => {
        return this.addNewPage(chapterDocRef.id)
      }).catch((error) => {
        this.$toast.error(`Error adding chapter:${error.message}`)
      })
    },
    addNewPage (chapterOid) {
      console.log(`Adding page to chapter:${chapterOid}`)
      return addPage({
        storyOid: this.story.id,
        chapterOid: chapterOid,
        page: ++this.chapterPages(chapterOid).pop().data.page,
        uid: this.uid,
        public: false
      }).then((pageDocRef) => {
        console.log(`Page Document written with ID:${pageDocRef.id}`)
        this.$router.push(`/story/detail/${pageDocRef.id}`)
      }).catch((error) => {
        this.$toast.error(`Error adding page:${error.message}`)
      })
    },
    enableChapterInput (event) {
      event.stopPropagation()
    }
  }
}
</script>

<style>
.chapter-name-in-txt {
  padding-top: 5px;
}

.chapter-name-in-txt .input-group__input {
  border-bottom: none;
}

.chapter-name-in-txt input {
  color: darkgrey!important;
}

.chapter-name-in-txt input:hover {
  color: white!important;
}

.chapter-name-in-txt .input-group__details {
  display: none;
}

.active-page {
  background-color: dimgrey;
}

.active-page .list__tile__title {
  color: white!important;
}

.link-to-page:hover {
  cursor: pointer;
  background-color: dimgrey;
}

.link-to-page:hover .list__tile__title {
  color: white!important;
}

.add-chapter-btn {
  /*text-align: center;*/
  padding: 10px;
  border: 1px solid darkgreen;
  background-color: green;
}

.add-chapter-btn:hover {
  cursor: pointer;
  background-color: forestgreen;
}

.add-page-btn {
  /*text-align: center;*/
  padding: 10px;
  border: 1px solid darkblue;
  background-color: darkslateblue;
}

.add-page-btn:hover {
  cursor: pointer;
  background-color: slateblue;
}

li.chapter-tile a.list__tile.list__tile--link {
  padding-left: 10px;
}
</style>
