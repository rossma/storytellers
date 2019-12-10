import debug from 'debug'
import FileUtils from '~/utils/file'

const log = debug('app:mixins/MediumViewerMixin')

export default {
  computed: {
    mediaRichTextType: function() {
      return 1
    },
    mediaBookType: function() {
      return 2
    },
    mediaImageType: function() {
      return 3
    },
    mediaQuoteType: function() {
      return 4
    }
  },
  created: function() {
    log('CREATED')
    /* this will run on both client and server */
  },
  beforeMount: function() {
    log('BEFORE MOUNT')
    /* this will only run on client not server */
  },
  mounted: function() {
    this.$nextTick(() => {
      log('MOUNTED')
      /* this will only run on client not server */
    })
  },
  methods: {
    isMediaQuoteType(activeMedium) {
      return activeMedium === this.mediaQuoteType
    },
    isMediaBookType(activeMedium) {
      return activeMedium === this.mediaBookType
    },
    isMediaImageType(activeMedium) {
      return activeMedium === this.mediaImageType
    },
    isMediaRichType(activeMedium) {
      return activeMedium === this.mediaRichTextType
    },
    isImage(type) {
      return FileUtils.isImage(type)
    },
    isBook(type) {
      return this.isEpub(type) || this.isPdf(type)
    },
    isEpub(type) {
      return FileUtils.isEpub(type)
    },
    isPdf(type) {
      return FileUtils.isPdf(type)
    }
  }
}
