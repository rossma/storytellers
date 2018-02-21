<template>
  <div>
    <v-tabs
      icons-and-text
      centered
      dark
      color="cyan"
      slot="extension"
      v-model="tab"
      grow
    >
      <v-tabs-slider color="yellow" />
      <v-tab>
        Writing
        <v-icon>mdi mdi-book-open-page-variant</v-icon>
      </v-tab>
      <v-tab>
        Picture
        <v-icon>mdi mdi-palette</v-icon>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            [[ TODO ]]
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
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
      </v-tab-item>
    </v-tabs-items>
    <story-tabs-medium-viewer
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
import StoryTabsMediumViewer from '~/components/StoryTabsMediumViewer'

export default {
  name: 'StoryTabs',
  components: {
    StoryTabsMediumViewer
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
      tab: null,
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
