<template>
  <client-only placeholder="Loading...">
    <rich-text-container
      :read-only="readOnly"
      :origin="origin"
      :src="src"
      @save="saveContent"
    />
  </client-only>
</template>

<script>
import debug from 'debug'
import RichTextContainer from './RichTextContainer'
const log = debug('app:components/MediumViewerRichText')

export default {
  name: 'MediumViewerRichText',
  components: {
    RichTextContainer
  },
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
  watch: {
    src: function(newValue, oldValue) {
      log('src has changed')
      // this.mutableSrc = newValue
    }
  },
  methods: {
    saveContent(content) {
      this.$emit('save', content)
    }
  }
}
</script>
