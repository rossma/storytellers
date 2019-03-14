<template>
  <v-layout
    class="editor-container2"
  >
    <quill-editor
      ref="textEditor"
      v-model="editorContent"
      :options="editorOption"
    />
  </v-layout>
</template>

<script>
import { EventBus } from '~/utils/event-bus.js'
import debug from 'debug'

const log = debug('app:components/RichTextContainer')

export default {
  name: 'RichTextContainer',
  props: {},
  data() {
    return {
      editorContent: '',
      editorOption: {
        placeholder: 'Once upon a time...',
        theme: 'snow',
        modules: {
          imageResize: true
        }
      }
    }
  },
  computed: {},
  mounted: function() {
    log('mounted')
    this.$nextTick(() => {
      // EventBus.$on('init-ebook', () => {
      //   this.init()
      // })
    })
  },
  beforeDestroy() {
    // EventBus.$off('init-ebook')
  },
  methods: {}
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
</style>
