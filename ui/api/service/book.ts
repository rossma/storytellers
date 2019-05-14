// import 'firebase/storage' // this is needed if page is refreshed otherwise error is thrown: ...storage() is not a function
// import firebaseApp from 'fire/app'
import { DB, STORAGE_REF } from 'fire/app'
import debug from 'debug'
const log = debug('app:api/service/book')

const uuidv4 = require('uuid/v4')
// const DB = firebaseApp.firestore()
// const STORAGE = firebaseApp.storage()
// const STORAGE_REF = STORAGE.ref()

function uploadBookToStorage(file, path, metadata) {
  log(`Uploading book:[${path}] to storage`)
  const uploadTask = STORAGE_REF.child(path).put(file, metadata)

  return uploadTask.then(snapshot => {
    log('Uploaded', snapshot.totalBytes, 'bytes.')
    return snapshot.ref.getDownloadURL()
  })
}

export function uploadPageBook(pageOid, bookFile) {
  log(`Upload page book for page oid:[${pageOid}]`)

  const bookOid = uuidv4()
  const bookExt = bookFile.name.split('.').pop()
  const filename = `${bookOid}.${bookExt}`

  const metadata = {
    contentType: bookFile.type
  }

  return uploadBookToStorage(bookFile, `books/${filename}`, metadata).then(
    downloadUrl => {
      const pageBookData = {
        book: {
          filename: filename,
          contentType: metadata.contentType,
          ref: downloadUrl,
          created: Date.now()
        }
      }
      const batch = DB.batch()
      const pageRef = DB.collection('pages').doc(pageOid)
      batch.update(pageRef, pageBookData)

      return batch.commit().then(() => {
        return Promise.resolve({
          filenameKey: pageBookData.book.filename,
          downloadUrl: pageBookData.book.ref
        })
      })
    }
  )
}
