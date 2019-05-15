<!--suppress CssUnusedSymbol -->
<template>
  <v-app
    toolbar
    footer
    dark
  >
    <the-navigation-toolbar>
      <template #nav-drawer>
        <v-divider light />
        <v-list dense>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title
                v-if="story"
                class="title"
              >
                {{ story.title }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-divider light />
        <v-list
          dense
          class="grey darken-3"
        >
          <template>
            <v-list>
              <v-list-group
                v-for="(chapter, chapterIdx) in filteredChapters"
                :key="chapter.id"
                :value="chapter.active"
              >
                <template #activator>
                  <v-list-tile class="chapter-tile">
                    <v-list-tile-content @click="enableChapterInput($event)">
                      <v-list-tile-title>
                        <v-text-field
                          :value="chapterDisplayName(chapter, chapterIdx)"
                          :readonly="!isEditable"
                          name="chapterNameTxt"
                          label="Chapter"
                          class="chapter-name-in-txt"
                          hide-details
                          single-line
                          @blur="saveChapterName($event, chapter)"
                        />
                      </v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </template>
                <v-list-tile
                  v-for="(page, pageIdx) in chapterPages(chapter.id)"
                  :key="page.id"
                  :class="[page.active ? 'active-page': '', 'link-to-page']"
                  @click="$router.push(`/story/${page.id}`)"
                >
                  <v-list-tile-content>
                    <v-list-tile-title class="grey--text">
                      {{ chapter.chapter }}-{{ ++pageIdx }}
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-layout
                  v-if="isEditable"
                  row
                  align-center
                >
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
            v-if="isEditable"
            row
            align-center
          >
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
      </template>
    </the-navigation-toolbar>
    <v-content>
      <nuxt />
    </v-content>
    <the-page-footer />
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { EventBus } from '~/utils/event-bus.js'
import ThePageFooter from '~/components/ThePageFooter'
import TheNavigationToolbar from '~/components/TheNavigationToolbar'
import {
  addChapter,
  updateChapterName,
  findChaptersByStory
} from '~/api/service/chapter'
import { addPage, findPagesByStory } from '~/api/service/page'
import debug from 'debug'
const log = debug('app:layouts/story')

export default {
  middleware: 'authenticated',
  components: {
    TheNavigationToolbar,
    ThePageFooter
  },
  data() {
    return {
      chapters: [],
      pages: [],
      story: {
        id: '',
        // ext: {
        //   activePage: null
        // },
        uid: '',
        title: ''
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['uid']),
    filteredChapters() {
      return this.chapters.filter(c => c && this.chapterPages(c.id).length > 0)
    },
    isEditable() {
      return this.story.uid === this.uid
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      EventBus.$on('storyEvent', story => {
        log(`[Story Layout] storyEvent received payload:[${story.id}]`)
        // this.story = { ...this.story, ...story }
        log('[Story Layout] story in store', story)
        this.story = Object.assign(story)
        log('[Story Layout] story values copied from store', this.story)
        this.loadChapters(this.story)
      })
    })
  },
  beforeDestroy() {
    EventBus.$off('storyEvent')
  },
  methods: {
    ...mapActions('page', ['savePages']),
    loadChapters(story) {
      findChaptersByStory(story.id)
        .then(chapters => {
          this.chapters = chapters
            .map(chapter => {
              if (story.activePage && story.activePage.chapterOid) {
                chapter.active = chapter.id === story.activePage.chapterOid
              }
              return chapter
            })
            .sort((a, b) => a.chapter - b.chapter)
          return findPagesByStory(story.id)
        })
        .then(pages => {
          this.pages = pages.map(page => {
            if (story.activePage) {
              page.active = page.id === story.activePage.id
            }
            return page
          })
          this.savePages(pages)
          EventBus.$emit('save-pages', pages)
        })
    },
    chapterPages(chapterOid) {
      return this.pages
        .filter(p => {
          return p.chapterOid === chapterOid && (this.uid === p.uid || p.public)
        })
        .sort((a, b) => a.page - b.page)
    },
    chapterDisplayName(chapter, index) {
      log('chapter name:', chapter.name)
      return chapter.name ? chapter.name : `Chapter ${++index}`
    },
    saveChapterName(event, chapter) {
      if (chapter.name !== event.target.value) {
        chapter.name = event.target.value
        updateChapterName(chapter.id, chapter.name)
      }
    },
    addNewChapter() {
      log('Adding chapter')
      return addChapter({
        storyOid: this.story.id,
        chapter: ++this.chapters.pop().chapter,
        uid: this.uid
      })
        .then(chapterDocRef => {
          return this.addNewPage(chapterDocRef.id)
        })
        .catch(error => {
          log('Error adding chapter:', error)
          this.$toast.error(`Error adding chapter`)
        })
    },
    addNewPage(chapterOid) {
      const pages = this.chapterPages(chapterOid)
      const chapterPage = (() => {
        if (pages && pages.length > 0) return pages[pages.length - 1].page + 1
        else return 1
      })()

      return addPage({
        storyOid: this.story.id,
        chapterOid: chapterOid,
        page: chapterPage,
        uid: this.uid,
        public: false
      })
        .then(pageDocRef => {
          log(`Page Document written with ID:${pageDocRef.id}`)
          this.$router.push(`/story/${pageDocRef.id}`)
        })
        .catch(error => {
          log('Error adding page:', error)
          this.$toast.error(`Error adding page`)
        })
    },
    enableChapterInput(event) {
      event.stopPropagation()
    }
  }
}
</script>

<style>
.chapter-name-in-txt {
  padding-top: 0px;
}

.chapter-name-in-txt .input-group__input {
  border-bottom: none;
}

.chapter-name-in-txt input {
  color: darkgrey !important;
}

.chapter-name-in-txt input:hover {
  color: white !important;
}

.chapter-name-in-txt .input-group__details {
  display: none;
}

.active-page {
  background-color: dimgrey;
}

.active-page .list__tile__title {
  color: white !important;
}

.link-to-page:hover {
  cursor: pointer;
  background-color: dimgrey;
}

.link-to-page:hover .list__tile__title {
  color: white !important;
}

.add-chapter-btn {
  /*text-align: center;*/
  padding: 10px;
  border: 1px solid #1565c0;
  background-color: #1976d2;
}

.add-chapter-btn:hover {
  cursor: pointer;
  background-color: #1e88e5;
}

.add-page-btn {
  /*text-align: center;*/
  padding: 10px;
  border: 1px solid #00796b;
  background-color: #00897b;
}

.add-page-btn:hover {
  cursor: pointer;
  background-color: #26a69a;
}

li.chapter-tile a.list__tile.list__tile--link {
  padding-left: 10px;
}
</style>
