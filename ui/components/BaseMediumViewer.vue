<template>
  <v-dialog
    v-model="dialog"
    hide-overlay
    persistent
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card class="dialog-container">
      <v-toolbar
        :color="theme"
        dense
        class="dialog-toolbar"
      >
        <v-btn
          icon
          @click.native="closeDialog()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="hidden-sm-and-down">
          {{ title }}
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items class="medium-viewer-toolbar">
          <slot
            name="toolbar-custom-items"
            :activeMedium="activeMedium"
          />
          <slot name="toolbar-medium-type-actions">
            <v-divider
              v-if="!readOnly && (isMediaImageType(activeMedium) || isMediaBookType(activeMedium))"
              class="mx-2"
              vertical
            />
            <v-tooltip
              v-if="!readOnly && (isMediaImageType(activeMedium) || isMediaBookType(activeMedium))"
              bottom
            >
              <template #activator="{ on }">
                <span
                  class="toolbar-upload"
                  v-on="on"
                >
                  <upload-button
                    :selected-callback="previewMediaFile"
                    :acceptedFileTypes="acceptedFileTypes"
                    icon="mdi-cloud-upload-outline"
                  />
                </span>
              </template>
              <span>Upload</span>
            </v-tooltip>
            <v-divider
              v-if="!canDelete"
              class="mx-2"
              vertical
            />
            <v-btn-toggle
              v-model="activeMedium"
              class="transparent"
              mandatory
            >
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn
                    v-if="showRichTextToolbarBtn"
                    :value="1"
                    text
                    v-on="on"
                  >
                    <v-icon>mdi-card-text-outline</v-icon>
                  </v-btn>
                </template>
                <span>Rich Text</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn
                    v-if="showBookToolbarBtn"
                    :value="2"
                    text
                    v-on="on"
                  >
                    <v-icon>mdi-book-outline</v-icon>
                  </v-btn>
                </template>
                <span>Words</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn
                    v-if="showImageToolbarBtn"
                    :value="3"
                    text
                    v-on="on"
                  >
                    <v-icon>mdi-brush</v-icon>
                  </v-btn>
                </template>
                <span>Pictures</span>
              </v-tooltip>
            </v-btn-toggle>
          </slot>
          <slot name="toolbar-save-btns">
            <v-btn
              v-if="!readOnly"
              text
              @click="saveMediaFile"
            >
              <v-icon>
                mdi-content-save-outline
              </v-icon>
              <span class="pl-2 hidden-sm-and-down">Save</span>
            </v-btn>
          </slot>
        </v-toolbar-items>
      </v-toolbar>
      <v-layout
        justify-start
        align-center
        columnpage-m
        fill-height
        class="dialog-content"
      >
        <!--        <v-flex xs12 fill-height>-->
        <slot
          name="content-container"
          :activeMedium="activeMedium"
        />
        <!--        </v-flex>-->
      </v-layout>
      <!--</v-responsive>-->
    </v-card>
  </v-dialog>
</template>

<script>
import UploadButton from '~/components/UploadButton'
import MediumViewerMixin from '../mixins/MediumViewerMixin'
import debug from 'debug'

const log = debug('app:components/BaseMediumViewer')

export default {
  name: 'BaseMediumViewer',
  components: {
    UploadButton
  },
  mixins: [MediumViewerMixin],
  props: {
    initialMedium: {
      type: Number,
      default: 3
    },
    canDelete: {
      type: Boolean,
      default: false
    },
    dialog: {
      type: Boolean,
      default: false
    },
    isBookEnabled: {
      type: Boolean,
      default: false
    },
    isImageEnabled: {
      type: Boolean,
      default: false
    },
    isRichTextEnabled: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      default: 'primary'
    },
    title: {
      type: String,
      default: ''
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      activeMedium: 3,
      fileType: null
      // hasImageChanged: false,
      // hasBookChanged: false,
      // richTextPreview: false
    }
  },
  computed: {
    acceptedFileTypes: function() {
      if (this.isImageEnabled) {
        return 'image/*'
      } else if (this.isBookEnabled) {
        return 'application/pdf, application/epub+zip'
      } else {
        return ''
      }
    },
    enabledMediumTypeCount: function() {
      let count = 0
      if (this.isRichTextEnabled) count++
      if (this.isBookEnabled) count++
      if (this.isImageEnabled) count++
      return count
    },
    showRichTextToolbarBtn: function() {
      return (
        this.enabledMediumTypeCount > 1 &&
        this.isRichTextEnabled &&
        !this.canDelete
      )
    },
    showBookToolbarBtn: function() {
      return (
        this.enabledMediumTypeCount > 1 && this.isBookEnabled && !this.canDelete
      )
    },
    showImageToolbarBtn: function() {
      return (
        this.enabledMediumTypeCount > 1 &&
        this.isImageEnabled &&
        !this.canDelete
      )
    }
  },
  watch: {
    initialMedium: function(newValue, oldValue) {
      this.activeMedium = newValue
    }
  },
  beforeMount: function() {
    this.activeMedium = this.initialMedium
  },
  mounted: function() {
    this.$nextTick(() => {
      log('MediumViewer:Mounted', this.storyCover)
    })
  },
  methods: {
    closeDialog() {
      this.$emit('close')
    },
    previewMediaFile(file) {
      log('in previewMediaFile', file)

      const limit = 2000000
      if (file.size > limit) {
        log(`file size if over the limit:${limit}`)
        this.$toast.error(`The file is over the ${limit / 1000 / 1000}MB limit`)
      } else {
        log('mime type:', file.type)

        this.$emit('on-upload-preview', file)

        this.fileType = file.type
        if (this.isImage(file.type)) {
          this.activeMedium = this.mediaImageType
        } else if (this.isPdf(file.type) || this.isEpub(file.type)) {
          this.activeMedium = this.mediaBookType
        } else {
          log('unknown file type')
          this.$toast.error(`The file is an supported file type`)
        }
      }
    },
    saveMediaFile() {
      this.$emit('save', this.activeMedium)
    }
  }
}
</script>
<style>
.v-toolbar__title {
  /*margin-right: 10px;*/
}

.medium-viewer-toolbar .v-tooltip {
  /*margin-top: 8px;*/
}

.toolbar-checkbox {
  margin-top: 13px !important;
}

.toolbar-custom-btn {
  /*margin-top: 6px !important;*/
}

.toolbar-upload {
  align-self: center;
  align-items: center;
}

span.v-tooltip {
  align-items: center;
  align-self: center;
}

.dialog-toolbar {
  /*z-index: 10;*/
}

.dialog-content {
  /*display: block;*/
  /*position: absolute;*/
  /*top: 0;*/
  /*padding-top: 49px;*/
  /*height: 100%;*/
  /*width: 100%;*/
  /*z-index: 1;*/
  /*overflow: hidden;*/
}
</style>
