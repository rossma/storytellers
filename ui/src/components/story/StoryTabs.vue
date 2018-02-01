<template>
  <div>
    <v-tabs
      dark
      grow
      icons>
      <v-toolbar
        color="cyan"
        dark>
        <v-tabs-bar
          class="cyan"
          slot="extension">
          <v-tabs-slider color="yellow" />
          <v-tabs-item href="#writing-tab">
            <v-icon>mdi mdi-book-open-page-variant</v-icon>
            Writing
          </v-tabs-item>
          <v-tabs-item href="#picture-tab">
            <v-icon>mdi mdi-palette</v-icon>
            Picture
          </v-tabs-item>
        </v-tabs-bar>
      </v-toolbar>
      <v-tabs-items>
        <v-tabs-content :id="'writing-tab'">
          <v-card flat>
            <v-card-text>
              [[ TODO ]]
            </v-card-text>
          </v-card>
        </v-tabs-content>
        <v-tabs-content :id="'picture-tab'">
          <v-card flat>
            <v-card-text class="text-xs-center">
              <img
                v-show="pageImageSrc()"
                class="card-img-top img-fluid thumb"
                :src="pageImageSrc()"
                @click.stop="openMediumDialog()"
                title="Upload">
              <img
                v-show="!pageImageSrc()"
                class="card-img-top img-fluid thumb"
                src="/img/missing-image.png"
                @click.stop="openMediumDialog()"
                title="Upload">
            </v-card-text>
          </v-card>
        </v-tabs-content>
      </v-tabs-items>
    </v-tabs>
    <medium-viewer
      :story-oid="page.data.storyOid"
      :chapter-oid="page.data.chapterOid"
      :page-oid="page.id"
      :current-image-oid="currentImageOid"
      :editable="editable"
      :has-story-cover="hasStoryCover"
      :dialog="imageDialog"
      :src="pageImageSrc()"
      @close="imageDialog = false" />
  </div>
</template>

<script>
import MediumViewer from '~/components/story/viewer/MediumViewer'

export default {
  name: 'StoryTabs',
  components: {
    MediumViewer
  },
  props: {
    page: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    },
    hasStoryCover: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      imageDialog: false
    }
  },
  computed: {
    currentImageOid: function () {
      return (this.page.data.image && this.page.data.image.filename)
    }
  },
  methods: {
    pageImageSrc () {
      if (this.page.data.image && this.page.data.image.ref) {
        return this.page.data.image.ref
      } else {
        return ''
      }
    },
    openMediumDialog () {
      this.imageDialog = true
    }
  }
}
</script>

<style>
  img {
    max-width: 100%;
    height: auto;
  }

  img.thumb {
    max-height: 300px;
    cursor: pointer;
  }
</style>
