export const IMAGE_TYPE = 'image'
export const EPUB_TYPE = 'epub'
export const PDF_TYPE = 'application/pdf'
export const RICH_TEXT_TYPE = 'json'

export default {
  isImage: type => {
    return type && type.includes(IMAGE_TYPE)
  },
  isEpub: type => {
    return type && type.includes(EPUB_TYPE)
  },
  isPdf: type => {
    return type && type.includes(PDF_TYPE)
  },
  pageRichTextSrc: page => {
    if (page.richText && page.richText.ref) {
      return page.richText.ref
    }
    return ''
  },
  pageBookSrc: page => {
    if (page.book && page.book.ref) {
      return page.book.ref
    }
    return ''
  },
  bookType: page => {
    if (page.book && page.book.contentType) {
      return page.book.contentType
    } else {
      return ''
    }
  },
  pageImageSrc: page => {
    if (page.image && page.image.ref) {
      return page.image.ref
    }
    return ''
  }
}
