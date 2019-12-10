<template>
  <v-container grid-list-md>
    <v-row
      justify="end"
      class="mt-4 mb-6"
      no-gutters
    >
      <v-col>
        <v-carousel
          v-model="colorCarousel"
          hide-delimiters
          height="200"
        >
          <v-carousel-item
            v-for="color in backgroundColors"
            :key="color"
          >
            <v-row
              class="fill-height"
              align="center"
              justify="center"
            >
              <v-sheet
                :color="color"
                height="200"
                width="400"
                tile
                justify-center
              >
                <div
                  class="quote-block2 text-center pa-2"
                  :class="color === '#ffffff' ? 'black--text' : ''"
                >
                  <span style="white-space: pre-line" class="quote-txt title">{{ src }}</span>
                </div>
              </v-sheet>
            </v-row>
          </v-carousel-item>
        </v-carousel>
      </v-col>
    </v-row>
    <v-row
      justify="end"
      class="mt-4 mb-6"
      no-gutters
    >
      <v-col>
        <v-textarea
          v-model.lazy="src"
          auto-grow
          filled
          :color="theme"
          label="Quote"
          rows="4"
          maxlength="300"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { BACKGROUND_COLOURS } from '~/api/service/preview'

// import debug from 'debug'
// const log = debug('app:components/PageDetailQuoteCapture')

export default {
  name: 'PageDetailQuoteCapture',
  props: {
    value: {
      type: Object,
      required: true
    },
    theme: {
      type: String,
      default: 'primary'
    }
  },
  data() {
    return {
      colorCarousel: 0
    }
  },
  computed: {
    backgroundColors() {
      return BACKGROUND_COLOURS
    },
    src: {
      get() {
        return this.value.src
      },
      set(src) {
        this.$emit('input', {
          src: src,
          background: this.selectedBackgroundColor(this.colorCarousel),
          color: this.selectedFontColor()
        })
      }
    }
  },
  watch: {
    colorCarousel: function(idx) {
      this.$emit('input', {
        src: this.src,
        background: this.selectedBackgroundColor(idx),
        color: this.selectedFontColor()
      })
    }
  },
  methods: {
    selectedBackgroundColor(index) {
      return this.backgroundColors[index]
    },
    selectedFontColor() {
      return this.selectedBackgroundColor(this.colorCarousel) === '#ffffff'
        ? '#000000'
        : '#ffffff'
    }
  }
}
</script>
<style>
.quote-block2 {
  height: 200px;
  text-align: center;
  /*line-height: 200px;*/
  overflow: hidden;
}

.quote-txt {
  display: inline-block;
  vertical-align: middle;
}
</style>
