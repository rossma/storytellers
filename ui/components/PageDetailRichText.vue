<template>
  <div>
    <v-card
      flat
      @click.stop="dialog = true"
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
          class="pa-4 rich-text-thumbnail-document"
        />
      </v-layout>
    </v-card>

    <v-dialog
      v-model="dialog"
      scrollable
      fullscreen
    >
      <v-card>
        <v-layout
          justify-center
          class="rich-text-container"
        >
          <component
            :is="compiled"
            class="pa-4 rich-text-document"
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
  components: {
  },
  props: {
    page: {
      type: Object,
      required: true
    },
    src: {
      type: String,
      required: true
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialog: false,
      editorContent: '',
      editorOption: {},
      compiled: ''
    }
  },
  computed: {
    editor() {
      return this.$refs.textEditor.quill
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      this.init()
    })
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
  max-height: 500px;
}

.rich-text-thumbnail-document {
  background-color: white;
  color: black;
  /*font-size: 1em;*/
}

.rich-text-thumbnail-document p {
  margin-bottom: 4px;
}

.rich-text-document {
  margin-top: 0px;
  height: 100%;
  padding: 20px 50px 20px 50px;
  background-color: #ffffff;
  color: #000000;
  font-size: 1.25em;
  width: 60em;
}

.rich-text-document p {
  margin-bottom: 4px;
}
</style>
