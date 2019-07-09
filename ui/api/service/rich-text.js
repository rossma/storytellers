import { DB } from 'fire/app'
import debug from 'debug'

import { uploadJsonToStorage } from './storage'
const log = debug('app:api/service/rich')

export function uploadPageRichText(pageOid, richTextJson) {
  log(`Upload page richText for page oid:[${pageOid}] json:`, richTextJson)

  return uploadJson(richTextJson).then(result => {
    log('in here download richtext URL:', result)

    const pageRichTextData = {
      richText: {
        filename: result.filename,
        ref: result.downloadUrl,
        created: Date.now()
      }
    }
    const batch = DB.batch()
    const pagesRef = DB.collection('pages').doc(pageOid)
    batch.update(pagesRef, pageRichTextData)

    return batch.commit().then(() => {
      return Promise.resolve({
        filenameKey: pageRichTextData.richText.filename,
        downloadUrl: pageRichTextData.richText.ref
      })
    })
  })
}

export function uploadJson(json) {
  log(`Uploading json`)
  return uploadJsonToStorage(json, 'richTexts')
}

// export function findRichTextFromUrl(url) {
//   log(`Finding richText by url:[${url}]`)
//   const httpsReference = STORAGE_REF.refFromURL(url);
//   return httpsReference.getDownloadURL()
// }
