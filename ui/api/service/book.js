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
  let uploadTask = STORAGE_REF.child(path).put(file, metadata)

  return uploadTask.then(snapshot => {
    log('Uploaded', snapshot.totalBytes, 'bytes.')
    return snapshot.ref.getDownloadURL()
  })
}

export function uploadPageBook(pageOid, currentBookOid, bookFile) {
  log(`Upload page book for page oid:[${pageOid}]`)

  const bookOid = uuidv4()
  const bookExt = bookFile.name.split('.').pop()

  let metadata = {
    contentType: bookFile.type
  }

  return uploadBookToStorage(
    bookFile,
    `books/${bookOid}.${bookExt}`,
    metadata
  ).then(downloadUrl => {
    const pageBookData = {
      book: {
        filename: `${bookOid}.${bookExt}`,
        contentType: metadata.contentType,
        ref: downloadUrl,
        created: Date.now()
      }
    }
    let batch = DB.batch()

    if (currentBookOid) {
      let currentBookRef = DB.collection('books').doc(currentBookOid)
      batch.delete(currentBookRef)
    }

    let pageRef = DB.collection('pages').doc(pageOid)
    batch.update(pageRef, pageBookData)

    return batch.commit().then(() => {
      return Promise.resolve({
        filenameKey: pageBookData.book.filename,
        downloadUrl: pageBookData.book.ref
      })
    })
  })
}

export function findBookByOid(bookOid) {
  log(`Finding book by oid:[${bookOid}]`)
  let bookRef = DB.collection('books').doc(bookOid)
  return bookRef.get()
}

export function deleteBook(bookOid) {
  log(`Deleting book by book id/filename:[${bookOid}]`)
  let bookRef = DB.collection('books').doc(bookOid)
  return bookRef.delete()
}
