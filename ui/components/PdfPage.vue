<script>
import debug from 'debug'
const log = debug('app:components/PdfPage')

export default {
  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true
    },
    scale: {
      type: Number,
      required: true
    }
  },

  computed: {
    actualSizeViewport() {
      return this.viewport.clone({ scale: this.scale })
    },

    canvasStyle() {
      const {
        width: actualSizeWidth,
        height: actualSizeHeight
      } = this.actualSizeViewport
      const pixelRatio = window.devicePixelRatio || 1
      // const pixelRatio = 1
      const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight].map(
        dim => Math.ceil(dim / pixelRatio)
      )
      log(`window.devicePixelRatio: ${window.devicePixelRatio} piixel ratio: ${pixelRatio} actualSizeWidth: ${actualSizeWidth}px actualSizeHeight: ${actualSizeHeight}px width: ${pixelWidth}px; height: ${pixelHeight}px;`)
      return `width: ${pixelWidth}px; height: ${pixelHeight}px;`
    },

    canvasAttrs() {
      let { width, height } = this.viewport
      ;[width, height] = [width, height].map(dim => Math.ceil(dim))

      const style = this.canvasStyle

      return {
        width,
        height,
        style,
        class: 'pdf-page'
      }
    },

    pageNumber() {
      return this.page.pageNumber
    }
  },

  watch: {
    page(page, oldPage) {
      this.destroyPage(oldPage)
    }
  },

  created() {
    // PDFPageProxy#getViewport
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.viewport = this.page.getViewport(this.scale)
  },

  mounted() {
    // log(`Page ${this.pageNumber} mounted`)
    this.renderPage()
  },

  beforeDestroy() {
    this.destroyPage(this.page)
  },

  methods: {
    renderPage() {
      // PDFPageProxy#render
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      this.renderTask = this.page.render(this.getRenderContext())
      this.renderTask.then(() => this.$emit('rendered', this.page)).then(() => {
        // log(`Page ${this.pageNumber} rendered`))
      })
    },

    destroyPage(page) {
      if (!page) return

      // PDFPageProxy#_destroy
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      page._destroy()

      // RenderTask#cancel
      // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
      if (this.renderTask) this.renderTask.cancel()
    },

    getRenderContext() {
      const { viewport } = this
      const canvasContext = this.$el.getContext('2d')

      return { canvasContext, viewport }
    }
  },

  render(h) {
    const { canvasAttrs: attrs } = this
    return h('canvas', { attrs })
  }
}
</script>
<style>
.pdf-page {
  display: block;
  margin: 0 auto 0.5em;
}
</style>
