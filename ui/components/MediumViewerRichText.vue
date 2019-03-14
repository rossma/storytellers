<template>
  <v-layout
    justify-center
    class="medium-viewer-rich-container"
  >
    <no-ssr>
      <rich-text-container />
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
  props: {}
}
</script>
