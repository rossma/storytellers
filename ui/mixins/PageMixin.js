import FileUtils from '~/utils/file'

export default {
  methods: {
    getPageRichTextSrc(page) {
      return FileUtils.pageRichTextSrc(page)
    },
    getPageBookSrc(page) {
      return FileUtils.pageBookSrc(page)
    },
    getBookType(page) {
      return FileUtils.bookType(page)
    },
    getIsEpub(bookType) {
      return bookType && FileUtils.isEpub(bookType)
    },
    getIsPdf(bookType) {
      return bookType && FileUtils.isPdf(bookType)
    },
    getPageImageSrc(page) {
      return FileUtils.pageImageSrc(page)
    },
    getPageQuoteSrc(page) {
      if (page.quote && page.quote.src) {
        return page.quote.src
      } else {
        return ''
      }
    }
  }
}
