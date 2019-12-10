<template>
  <v-layout 
    justify-center
    mb-2
  >
    <v-card
      v-if="showThumbnail"
      flat
      class="mx-auto text-center"
      :color="background"
      dark
      width="100%"
      max-width="600"
    >
      <v-card-text
        :class="`${color}--text`"
        class="title"
        align="center"
      >
        <span style="white-space: pre-line">{{ src }}</span>
      </v-card-text>
    </v-card>
    <v-dialog
      v-model="mutableDialog"
      scrollable
      fullscreen
      hide-overlay
    >
      <v-card fill-height dark>
        <v-btn
          color="grey"
          dark
          fab
          icon
          fixed
          @click="mutableDialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-layout
          dark
          align-center
          justify-center
          class="quote-container"
        >
          <v-card
            flat
            class="mx-auto text-center"
            :color="background"
            dark
            width="100%"
            max-width="600"
          >
            <v-card-text
              :class="`${color}--text`"
              class="title"
              align="center"
            >
              <span style="white-space: pre-line">{{ src }}</span>
            </v-card-text>
          </v-card>
        </v-layout>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
export default {
  name: 'PageDetailQuote',
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
      mutableDialog: this.dialog
    }
  },
  computed: {
    color() {
      return this.page.quote && this.page.quote.color !== '#000000'
        ? 'white'
        : 'black'
    },
    background() {
      return this.page.quote
        ? this.page.quote.background || '#26c6da'
        : '#26c6da'
    }
  }
}
</script>
