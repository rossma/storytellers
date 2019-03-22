<template>
  <v-layout
    justify-center
    class="medium-viewer-rich-container"
  >
    <no-ssr>
      <rich-text-container
        :editable="editable"
        :rich-text-src="richTextSrc"
      />
    </no-ssr>
  </v-layout>
</template>

<script>
import RichTextContainer from './RichTextContainer'

export default {
  name: 'MediumViewerRichText',
  components: {
    RichTextContainer
  },
  props: {
    editable: {
      type: Boolean,
      default: false
    },
    richTextSrc: {
      type: String,
      required: true
    }
  }
}
</script>
