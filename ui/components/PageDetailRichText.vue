<template>
  <div>
    <v-card
      v-if="showThumbnail"
      flat
      @click.stop="mutableDialog = true"
    >
      <v-layout
        justify-center
        class="rich-text-thumbnail-container"
      >
        <quill-editor
          v-show="false"
          ref="textEditor"
          v-model="editorContent"
          :options="editorOption"
        />

        <component
          :is="compiled"
          class="pa-10 rich-text-thumbnail-document"
        />
      </v-layout>
    </v-card>

    <v-dialog
      v-model="mutableDialog"
      fullscreen
      hide-overflow
    >
      <v-card flat>
        <v-btn
          color="grey"
          dark
          fab
          icon
          fixed
          @click="mutableDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-layout
          justify-center
          fill-height
          class="rich-text-container"
        >
          <component
            :is="compiled"
            class="pa-12 rich-text-document"
          />
        </v-layout>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import debug from 'debug'
const log = debug('app:components/PageDetailRichText')

export default {
  name: 'PageDetailRichText',
  components: {},
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    page: {
      type: Object,
      required: true
    },
    showThumbnail: {
      type: Boolean,
      default: true
    },
    src: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'primary'
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      mutableDialog: this.dialog,
      editorContent: '',
      editorOption: {},
      compiled: ''
    }
  },
  computed: {
    editor() {
      log('what am i doing in here someone tell me please?!!!!!')
      return this.$refs.textEditor.quill
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      // EventBus.$on(`open-page-detail-rich-text-dialog`, () => {
      //   log('in open-page-detail-rich-text-dialog')
      //   this.dialog = true
      //   this.init()
      // })

      this.init()
    })
  },
  beforeDestroy() {
    // EventBus.$off(`open-page-detail-rich-text-dialog`)
  },
  methods: {
    init() {
      // todo - duplicated method
      const Quill = require('quill')
      const Delta = Quill.import('delta')

      // this.configureEditor(new Delta())

      // const str = {
      //   ops: [
      //     { insert: 'd\ndddddddddd' },
      //     { insert: '\n', attributes: { header: 1 } },
      //     { insert: 'ddddddd', attributes: { bold: true } },
      //     { retain: 1, attributes: { header: null } }
      //   ]
      // }

      if (this.src) {
        this.getContentFromUrl(this.src).then(deltaStr => {
          log('val from content', deltaStr)
          if (deltaStr) {
            log('delta string is set')
            const startDelta = new Delta(deltaStr)
            this.editor.setContents(startDelta)
            const html = this.editor.root.innerHTML
            log('richTextHtml:', html)
            this.compiled = Vue.compile(`<div>${html}</div>`)
          } else {
            log('delta string is NOT set')
          }
        })
      }
    },
    getContentFromUrl(url) {
      log('in getContentFromUrl')
      return this.$axios.$get(url)
    }
  }
}
</script>

<style>
.rich-text-thumbnail-container {
  background-color: #e2e2e2;
  cursor: pointer;
  height: 500px;
}

.rich-text-thumbnail-document {
  background-color: white;
  color: black;
  overflow: hidden;
  /*font-size: 1em;*/
}

.rich-text-thumbnail-document p {
  margin-bottom: 4px;
}

.rich-text-document {
  margin-top: 0px;
  /*height: 100%;*/
  min-height: 100vh;
  padding: 20px 50px 20px 50px;
  background-color: #ffffff;
  color: #000000;
  font-size: 1.25em;
  width: 60rem;
}

.rich-text-document p {
  margin-bottom: 4px;
}
</style>
