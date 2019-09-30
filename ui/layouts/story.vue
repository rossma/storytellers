<!--suppress CssUnusedSymbol -->
<template>
  <v-app
    toolbar
    footer
  >
    <the-navigation-toolbar>
      <template #nav-drawer>
        <v-divider light />
        <v-list dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title
                v-if="story"
                class="title"
              >
                {{ story.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
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
                class="chapter-group-expand"
              >
                <template #activator>
                  <v-text-field
                    :value="chapterDisplayName(chapter, chapterIdx)"
                    :readonly="!isEditable"
                    name="chapterNameTxt"
                    label="Chapter"
                    class="chapter-name-in-txt"
                    hide-details
                    single-line
                    @click="enableChapterInput($event)"
                    @blur="saveChapterName($event, chapter)"
                  />
                </template>

                <v-list-item
                  v-for="(page, pageIdx) in chapterPages(chapter.id)"
                  :key="page.id"
                  :class="[page.active ? 'active-page': '', 'link-to-page']"
                  @click="$router.push(`/story/${page.id}`)"
                >
                  <v-list-item-content>
                    <v-list-item-title class="grey--text">
                      {{ chapter.chapter }}-{{ ++pageIdx }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-layout
                  v-if="isEditable"
                  align-center
                >
                  <v-flex
                    class="add-page-btn"
                    xs12
                    @click="addNewPage(chapter.id)"
                  >
                    <v-icon>mdi-plus</v-icon>
                    <span class="ml-2">Page</span>
                  </v-flex>
                </v-layout>
              </v-list-group>
            </v-list>
          </template>
          <v-layout
            v-if="isEditable"
            align-center
          >
            <v-flex
              class="add-chapter-btn"
              xs12
              @click="addNewChapter()"
            >
              <v-icon>mdi-plus</v-icon>
              <span class="ml-2">Chapter</span>
            </v-flex>
          </v-layout>
        </v-list>
      </template>
    </the-navigation-toolbar>
    <v-content>
      <nuxt />
    </v-content>
    <portal-target name="medium-viewer-dialog" />
    <portal-target name="contribution-medium-viewer-dialog" />
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
    ...mapActions('page', ['savePages', 'saveActivePage']),
    ...mapActions('chapter', ['saveActiveChapter']),
    loadChapters(story) {
      findChaptersByStory(story.id)
        .then(chapters => {
          this.chapters = chapters
            .sort((a, b) => a.chapter - b.chapter)
            .map((chapter, index) => {
              log('in chapter loop', index)
              if (story.activePage && story.activePage.chapterOid) {
                chapter.active = chapter.id === story.activePage.chapterOid
                if (chapter.active) {
                  log('active chapter', index)
                  this.saveActiveChapter({ index: ++index, chapter: chapter })
                }
              }
              return chapter
            })
          return findPagesByStory(story.id)
        })
        .then(pages => {
          // we only want parent pages
          this.pages = pages
            .filter(page => {
              return typeof page.parentPagesOid === 'undefined'
            })
            .sort((a, b) => a.page - b.page)
            .map((page, index) => {
              if (story.activePage) {
                page.active = page.id === story.activePage.id
                if (page.active) {
                  log('active page', index, page)
                  this.saveActivePage({ index: ++index, page: page })
                }
              }
              return page
            })
          this.savePages(this.pages)
          EventBus.$emit('save-pages', this.pages)
        })
    },
    chapterPages(chapterOid) {
      return this.pages
        .filter(page => {
          return (
            page.chapterOid === chapterOid &&
            (this.uid === page.uid || page.public)
          )
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
        invite: false,
        public: false
      })
        .then(page => {
          log(`Page Document written with ID:${page.id}`)
          this.$router.push(`/story/${page.id}`)
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
  margin-top: 0px;
}

.chapter-name-in-txt > .v-input__control > .v-input__slot:before {
  border-style: none;
}

.chapter-name-in-txt > .v-input__control > .v-input__slot:after {
  border-style: none;
}

.chapter-name-in-txt input {
  color: darkgrey !important;
}

.chapter-name-in-txt input:hover {
  color: white !important;
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

.chapter-group-expand.primary--text {
  color: white !important;
}
</style>
