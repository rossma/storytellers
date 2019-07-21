import { STORAGE_REF } from 'fire/app'
import debug from 'debug'
import { Base64 } from 'js-base64'
const log = debug('app:api/service/storage')

const uuidv4 = require('uuid/v4')

export function uploadFileToStorage(file, path) {
  const filename = uuidv4()
  const fileExt = file.name.split('.').pop()
  const fullPath = `${path}/${filename}.${fileExt}`
  log(`Uploading file:[${fullPath}] to storage`)

  const metadata = {
    contentType: file.type
  }

  const uploadTask = STORAGE_REF.child(fullPath).put(file, metadata)

  return uploadTask
    .then(snapshot => {
      log('Uploaded', snapshot.totalBytes, 'bytes.')

      return snapshot.ref.getDownloadURL()
    })
    .then(downloadUrl => {
      return Promise.resolve({
        contentType: metadata.contentType,
        downloadUrl: downloadUrl,
        filename: filename
      })
    })
}

export function uploadJsonToStorage(json, path) {
  const filename = uuidv4()
  const fullPath = `${path}/${filename}.json`
  log(`Uploading file:[${fullPath}] to storage`)

  const uploadTask = STORAGE_REF.child(fullPath).putString(
    Base64.encode(JSON.stringify(json)),
    'base64'
  )

  return uploadTask
    .then(snapshot => {
      log('Uploaded', snapshot.totalBytes, 'bytes.')

      return snapshot.ref.getDownloadURL()
    })
    .then(downloadUrl => {
      return Promise.resolve({
        downloadUrl: downloadUrl,
        filename: filename
      })
    })
}
