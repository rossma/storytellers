<template>
  <v-layout
    class="editor-container"
  >
    <quill-editor
      v-show="editable && !isPreview"
      ref="textEditor"
      v-model="editorContent"
      :options="editorOption"
    />

    <component
      :is="compiled"
      v-show="!editable || isPreview"
      class="preview-container"
    />
  </v-layout>
</template>

<script>
import { EventBus } from '~/utils/event-bus.js'
import Vue from 'vue'
import { uploadPageRichText } from '~/api/service/rich-text'
import debug from 'debug'
const log = debug('app:components/RichTextContainer')

export default {
  name: 'RichTextContainer',
  components: {},
  props: {
    editable: {
      type: Boolean,
      default: false
    },
    richTextSrc: {
      type: String,
      required: true
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
  beforeMount: function() {
    log('before mounted downloaded url:', this.richTextSrc)
    // if (this.richTextSrc) {
    //   this.setContentFromUrl(this.richTextSrc)
    // }
  },
  mounted: function() {
    log('mounted', this.editor)
    log('editable', this.editable)
    log('ispreview', this.isPreview)

    this.$nextTick(() => {
      log('next tick', this.richTextSrc)

      // register events
      EventBus.$on('rich-text-preview', params => {
        this.isPreview = params.isPreview
        if (this.isPreview) {
          this.preview(this.editor.root.innerHTML)
        }
      })

      EventBus.$on('rich-text-save', params => {
        this.save(params.pageOid, this.editor.getContents())
      })

      // initialise RichText
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

      if (this.richTextSrc) {
        this.getContentFromUrl(this.richTextSrc).then(val => {
          log('val from content', val)
          if (val) {
            this.deltaStr = val
            log('delta string is set')
            const startDelta = new Delta(this.deltaStr)
            log('getcontent', this.editor.getContents())
            this.editor.setContents(startDelta)

            // for non editors
            if (!this.editable) {
              this.preview(this.editor.root.innerHTML)
            }
          } else {
            log('delta string is NOT set')
          }
        })
      }
    })
  },
  beforeDestroy() {
    EventBus.$off('rich-text-preview')
    EventBus.$off('rich-text-save')
  },
  methods: {
    async setContentFromUrl(url) {
      log('in setContentFromUrl')
      const data = await this.$axios.$get(url)
      log('data:', data)
      this.deltaStr = data
    },
    getContentFromUrl(url) {
      log('in getContentFromUrl')
      return this.$axios.$get(url)
    },
    configureEditor(change) {
      this.editor.on('text-change', function(delta) {
        log('on editor change', delta)
        change = change.compose(delta)
        log('change', change)
        log('toString', JSON.stringify(change))
      })
    },
    preview(html) {
      log('previewing html', html)
      this.compiled = Vue.compile(`<div>${html}</div>`)
    },
    save(pageOid, contents) {
      log('Saving Rich Text')

      uploadPageRichText(pageOid, contents)
        .then(result => {
          EventBus.$emit('story-rich-text-file-key', {
            filenameKey: result.filenameKey,
            richTextSrc: result.downloadUrl
          })
        })
        .catch(error => {
          log('There was an error uploading rich text ', error)
          this.$toast.error(error.message)
        })
        .then(() => {
          this.$toast.success('Story was save successfully')
        })
    }
  }
}
</script>

<style scoped>
.quill-editor {
  background-color: white;
  color: black;
  width: 100%;
  /*height: 100%;*/
}

.editor-container {
  /*min-height: 80vh;*/
}

.preview-container {
  padding: 10px;
  width: 100%;
  background-color: #ffffff;
  color: #000000;
  height: auto;
  overflow: auto;
}
</style>
