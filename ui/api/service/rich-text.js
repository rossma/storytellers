// import 'firebase/storage' // this is needed if page is refreshed otherwise error is thrown: ...storage() is not a function
// import firebaseApp from 'fire/app'
import { DB, STORAGE_REF } from 'fire/app'
import debug from 'debug'
const log = debug('app:api/service/rich')

const uuidv4 = require('uuid/v4')

function uploadRichTextToStorage(json, path) {
  log(`Uploading richText:[${path}] to storage`)
  const uploadTask = STORAGE_REF.child(path).putString(
    btoa(JSON.stringify(json)),
    'base64'
  )

  return uploadTask.then(snapshot => {
    log('Uploaded', snapshot.totalBytes, 'bytes.')
    log('Metadata:', snapshot.metadata)
    log('DownloadURL:', snapshot.downloadURL)
    return snapshot.ref.getDownloadURL()
  })
}

export function uploadPageRichText(pageOid, richTextJson) {
  log(`Upload page richText for page oid:[${pageOid}] json:`, richTextJson)

  const richTextOid = uuidv4()
  const filename = `${richTextOid}.json`

  return uploadRichTextToStorage(richTextJson, `richTexts/${filename}`).then(
    downloadUrl => {
      log('in here download URL:', downloadUrl)

      const pageRichTextData = {
        richText: {
          filename: filename,
          ref: downloadUrl,
          created: Date.now()
        }
      }
      const batch = DB.batch()
      const pageRef = DB.collection('pages').doc(pageOid)
      batch.update(pageRef, pageRichTextData)

      return batch.commit().then(() => {
        return Promise.resolve({
          filenameKey: pageRichTextData.richText.filename,
          downloadUrl: pageRichTextData.richText.ref
        })
      })
    }
  )
}

// export function findRichTextFromUrl(url) {
//   log(`Finding richText by url:[${url}]`)
//   const httpsReference = STORAGE_REF.refFromURL(url);
//   return httpsReference.getDownloadURL()
// }
