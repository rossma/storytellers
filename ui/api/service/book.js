import { DB } from 'fire/app'
import debug from 'debug'
import { uploadFileToStorage } from './storage'

const log = debug('app:api/service/book')

export function uploadPageBook(pageOid, bookFile) {
  log(`Upload page book for page oid:[${pageOid}]`)

  return uploadBook(bookFile).then(result => {
    log('in here download book URL:', result)
    const pageBookData = {
      book: {
        filename: result.filename,
        contentType: result.contentType,
        ref: result.downloadUrl,
        created: Date.now()
      }
    }
    const batch = DB.batch()
    const pagesRef = DB.collection('pages').doc(pageOid)
    batch.update(pagesRef, pageBookData)

    return batch.commit().then(() => {
      return Promise.resolve({
        filenameKey: pageBookData.book.filename,
        downloadUrl: pageBookData.book.ref,
        contentType: pageBookData.book.contentType
      })
    })
  })
}

export function uploadBook(bookFile) {
  log(`Uploading book`)
  return uploadFileToStorage(bookFile, 'books')
}
