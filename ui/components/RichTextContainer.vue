<template>
  <!--  <v-layout-->
  <!--    class="editor-container"-->
  <!--  >-->
  <v-layout
    fluid
    justify-center
    class="editor-container"
  >
    <!--    <v-layout-->
    <!--    justify-center-->
    <!--    class="medium-viewer-rich-container"-->
    <!--  >-->
    <!--      <v-flex xs12>-->

    <!--  <div class="editor-container">-->
    <quill-editor
      v-show="!readOnly && !isPreview"
      ref="textEditor"
      v-model="editorContent"
      :options="editorOption"
    />

    <component
      :is="compiled"
      v-show="readOnly || isPreview"
      class="preview-container"
    />
    <!--      </v-flex>-->
  </v-layout>
<!--  </div>-->
</template>

<script>
import { EventBus } from '~/utils/event-bus.js'
import Vue from 'vue'
import debug from 'debug'
const log = debug('app:components/RichTextContainer')

export default {
  name: 'RichTextContainer',
  components: {},
  props: {
    origin: {
      type: String,
      default: 'page'
    },
    readOnly: {
      type: Boolean,
      default: true
    },
    src: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      deltaStr: null,
      compiled: null,
      editorContent: '',
      editorOption: {
        placeholder: 'Once upon a time...',
        theme: 'snow',
        modules: {
          imageResize: true
        }
      },
      isPreview: false
    }
  },
  computed: {
    editor() {
      return this.$refs.textEditor.quill
    }
    // htmlComponent: function() {
    //   return {
    //     template: `<div>${this.tmp}</div>`
    //   }
    // }
  },
  mounted: function() {
    log('mounted', this.editor)
    log('readOnly', this.readOnly)
    log('ispreview', this.isPreview)

    this.$nextTick(() => {
      log('next tick', this.src)

      // register events
      EventBus.$on(`rich-text-preview-${this.origin}`, ({ isPreview }) => {
        log('in rich-text-preview', this.origin)
        this.isPreview = isPreview
        if (this.isPreview) {
          this.preview(this.editor.root.innerHTML)
        }
      })

      EventBus.$on('rich-text-save', () => {
        this.$emit('save', this.editor.getContents())
      })

      this.init()
    })
  },
  beforeDestroy() {
    EventBus.$off(`rich-text-preview-${this.origin}`)
    EventBus.$off('rich-text-save')
  },
  methods: {
    // async setContentFromUrl(url) {
    //   log('in setContentFromUrl')
    //   const data = await this.$axios.$get(url)
    //   log('data:', data)
    //   this.deltaStr = data
    // },
    init() {
      const Quill = require('quill')
      const Delta = Quill.import('delta')

      this.configureEditor(new Delta())

      // const str = {
      //   ops: [
      //     { insert: 'd\ndddddddddd' },
      //     { insert: '\n', attributes: { header: 1 } },
      //     { insert: 'ddddddd', attributes: { bold: true } },
      //     { retain: 1, attributes: { header: null } }
      //   ]
      // }

      if (this.src) {
        this.getContentFromUrl(this.src).then(val => {
          log('val from content', val)
          if (val) {
            this.deltaStr = val
            log('delta string is set')
            const startDelta = new Delta(this.deltaStr)
            log('getcontent', this.editor.getContents())
            this.editor.setContents(startDelta)

            // for non editors
            if (this.readOnly) {
              this.preview(this.editor.root.innerHTML)
            }
          } else {
            log('delta string is NOT set')
          }
        })
      }
    },
    getContentFromUrl(url) {
      log('in getContentFromUrl')
      return this.$axios.$get(url)
    },
    configureEditor(change) {
      this.editor.on('text-change', function(delta) {
        // log('on editor change', delta)
        change = change.compose(delta)
        // log('change', change)
        // log('toString', JSON.stringify(change))
      })
    },
    preview(html) {
      log('previewing html', html)
      this.compiled = Vue.compile(`<div>${html}</div>`)
    }
    // save(pageOid, contents) {
    //   log('Saving Rich Text')
    //
    //   uploadPageRichText(pageOid, contents)
    //     .then(result => {
    //       EventBus.$emit('story-rich-text-file-key', {
    //         filenameKey: result.filenameKey,
    //         richTextSrc: result.downloadUrl
    //       })
    //     })
    //     .catch(error => {
    //       log('There was an error uploading rich text ', error)
    //       this.$toast.error(error.message)
    //     })
    //     .then(() => {
    //       this.$toast.success('Story was save successfully')
    //     })
    // }
  }
}
</script>

<style scoped>
.editor-container {
  margin-top: 0px;
  /*border: 5px solid purple;*/
  height: 100%;
}

.quill-editor {
  background-color: white;
  color: black;
  /*border: 20px solid red;*/
  height: 100%;
  width: 60em;
}

.ql-editor {
  background-color: white;
}

.preview-container {
  margin-top: 0px;
  height: 100%;
  padding: 20px 50px 20px 50px;
  background-color: #ffffff;
  color: #000000;
  width: 60em;
}

.preview-container p {
  margin-bottom: 0px;
}
</style>
