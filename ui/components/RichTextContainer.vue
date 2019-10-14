<template>
  <v-layout
    fluid
    justify-center
    class="editor-container"
  >
    <quill-editor
      v-show="!readOnly && !isPreview"
      ref="textEditor"
      v-model="editorContent"
      :options="editorOption"
    />
    <component
      :is="compiled"
      v-show="readOnly || isPreview"
      class="preview-container ql-editor"
    />
  </v-layout>
</template>

<script>

import { EventBus } from '~/utils/event-bus.js'
import Vue from 'vue'
import debug from 'debug'
const log = debug('app:components/RichTextContainer')

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],
  // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  // [{ 'direction': 'rtl' }],                         // text direction

  // [{ 'size': [{'small': '0.75em'}, {'normal': '1em'}, {'large': '1.5em'}, {'huge': '2em'}] }],  // custom dropdown
  // [{ 'size': ['small', 'false', 'large', 'huge'] }],  // custom dropdown
  // [{ 'size': ['24px', '26px', '28px'] }],  // custom dropdown
  //  [{ 'size': ['14px', '26px', '38px', '48px'] }],  // custom dropdown
  [{ 'size': ['0.75em', '1em', '1.5em', '2em'] }],  // custom dropdown
  // [{ 'size': [] }],  // dropdown with defaults from theme
  // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['link', 'image'],
  ['clean']                                         // remove formatting button
]

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
          toolbar: toolbarOptions,
          imageDrop: true,
          imageResize: {
            displayStyles: {
              backgroundColor: 'black',
              border: 'none',
              color: 'white'
            },
            modules: [ 'Resize', 'DisplaySize', 'Toolbar' ]
          }
        }
      },
      isPreview: false
    }
  },
  computed: {
    editor() {
      return this.$refs.textEditor.quill
    }
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
    init() {
      const Quill = require('quill')
      const Delta = Quill.import('delta')

      this.configureEditor(new Delta())

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
      })
    },
    preview(html) {
      log('previewing html', html)
      this.compiled = Vue.compile(`<div>${html}</div>`)
    }
  }
}
</script>

<style>
.editor-container {
  padding-top: 1px;
  /*border: 5px solid purple;*/
  height: 89vh;
}

.quill-editor {
  background-color: white;
  color: black;
  /*border: 20px solid red;*/
  /*height: 90vh;*/
  width: 60rem;
}

.ql-container.ql-snow {
  border: none !important;
}

.ql-editor {
  background-color: white;
  font-size: 21px;
}

.preview-container {
  /*margin-top: 0px;*/
  height: 93vh;
  padding: 20px 50px 20px 50px;
  background-color: #ffffff;
  color: #000000;
  width: 60rem;
  /*font-size: 21px;*/
}

.preview-container p {
  margin-bottom: 0px;
}

.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="0.75em"]::before {
  content: 'Small';
  font-size: 0.75em !important;
}

.ql-picker-label[data-value="0.75em"]::before {
  content: 'Small' !important;
}

.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="1em"]::before {
  content: 'Normal';
  font-size: 1em !important;
}

.ql-picker-label[data-value="1em"]::before {
  content: 'Normal' !important;
}

.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="1.5em"]::before {
  content: 'Large';
  font-size: 1.5em !important;
}

.ql-picker-label[data-value="1.5em"]::before {
  content: 'Large' !important;
}

.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="2em"]::before {
  content: 'Huge';
  font-size: 2em !important;
}

.ql-picker-label[data-value="2em"]::before {
  content: 'Huge' !important;
}

</style>
