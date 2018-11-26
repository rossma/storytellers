import 'firebase/storage' // this is needed if page is refreshed otherwise error is thrown: ...storage() is not a function
import firebaseApp from '~/firebase/app'

const uuidv4 = require('uuid/v4')
const DB = firebaseApp.firestore()
const STORAGE = firebaseApp.storage()
const STORAGE_REF = STORAGE.ref()

function uploadBookToStorage (file, path, metadata) {
  console.log(`[Book Service] - Uploading book:[${path}] to storage`)
  let uploadTask = STORAGE_REF.child(path).put(file, metadata)

  return uploadTask.then((snapshot) => {
    console.log('[Book Service] - Uploaded', snapshot.totalBytes, 'bytes.')
    console.log('[Book Service] - Metadata:', snapshot.metadata)
    console.log('[Book Service] - DownloadURL:', snapshot.downloadURL)
    return snapshot.ref.getDownloadURL()
  })
}

export function uploadPageBook (pageOid, currentBookOid, bookFile) {
  console.log(`[Book Service] - Upload page book for page oid:[${pageOid}]`)

  const bookOid = uuidv4()
  const bookExt = bookFile.name.split('.').pop()

  let metadata = {
    'contentType': bookFile.type
  }

  return uploadBookToStorage(bookFile, `books/${bookOid}.${bookExt}`, metadata).then((downloadUrl) => {
    const pageBookData = {
      book: {
        filename: `${bookOid}.${bookExt}`,
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

export function findBookByOid (bookOid) {
  console.log(`[Book Service] - Finding book by oid:[${bookOid}]`)
  let bookRef = DB.collection('books').doc(bookOid)
  return bookRef.get()
}

export function deleteBook (bookOid) {
  console.log(`[Book Service] - Deleting book by book id/filename:[${bookOid}]`)
  let bookRef = DB.collection('books').doc(bookOid)
  return bookRef.delete()
}
