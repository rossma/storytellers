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
  }
}
