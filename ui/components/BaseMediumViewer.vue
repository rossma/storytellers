<template>
  <v-dialog
    v-model="dialog"
    hide-overlay
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-layout
      dark
      column
      fill-height
    >
      <v-card class="dialog-container">
        <v-toolbar
          dark
          :color="theme"
        >
          <v-btn
            icon
            dark
            @click.native="closeDialog()"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
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
                      icon="cloud_upload"
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
                      v-if="isRichTextEnabled && !canDelete"
                      :value="1"
                      flat
                      v-on="on"
                    >
                      <v-icon>text_format</v-icon>
                    </v-btn>
                  </template>
                  <span>Rich Text</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-btn
                      v-if="isBookEnabled && !canDelete"
                      :value="2"
                      flat
                      v-on="on"
                    >
                      <v-icon>book</v-icon>
                    </v-btn>
                  </template>
                  <span>Words</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-btn
                      v-if="isImageEnabled && !canDelete"
                      :value="3"
                      flat
                      v-on="on"
                    >
                      <v-icon>brush</v-icon>
                    </v-btn>
                  </template>
                  <span>Pictures</span>
                </v-tooltip>
              </v-btn-toggle>
            </slot>
            <slot name="toolbar-save-btns">
              <v-btn
                v-if="!readOnly"
                dark
                flat
                @click="saveMediaFile"
              >
                <v-icon left>
                  save
                </v-icon>
                Save
              </v-btn>
            </slot>
          </v-toolbar-items>
        </v-toolbar>
        <v-layout
          justify-center
          dark
          fill-height
        >
          <slot
            name="content-container"
            :activeMedium="activeMedium"
          />
        </v-layout>
        <!--</v-responsive>-->
      </v-card>
    </v-layout>
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
      default: true
    },
    isImageEnabled: {
      type: Boolean,
      default: true
    },
    isRichTextEnabled: {
      type: Boolean,
      default: true
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
  watch: {
    initialMedium: function(newValue, oldValue) {
      this.activeMedium = newValue
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
  margin-top: 15px !important;
}

.toolbar-custom-btn {
  margin-top: 20px !important;
}

.toolbar-upload {
  align-self: center;
  align-items: center;
}

.dialog-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

span.v-tooltip {
  align-items: center;
  align-self: center;
}
</style>
