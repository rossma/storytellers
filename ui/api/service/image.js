// import 'firebase/storage' // this is needed if page is refreshed otherwise error is thrown: ...storage() is not a function
// import firebaseApp from 'fire/app'
import { DB, STORAGE_REF } from 'fire/app'
import debug from 'debug'
const log = debug('app:api/service/image')

const uuidv4 = require('uuid/v4')

function uploadImageToStorage (file, path, metadata) {
  log(`Uploading image:[${path}] to storage`)
  let uploadTask = STORAGE_REF.child(path).put(file, metadata)

  return uploadTask.then((snapshot) => {
    log('Uploaded', snapshot.totalBytes, 'bytes.')
    log('Metadata:', snapshot.metadata)
    log('DownloadURL:', snapshot.downloadURL)
    return snapshot.ref.getDownloadURL()
  })
}

export function uploadPageImage (pageOid, currentImageOid, imageFile) {
  log(`Upload page image for page oid:[${pageOid}]`)

  const imageOid = uuidv4()
  const imageExt = imageFile.name.split('.').pop()

  let metadata = {
    'contentType': imageFile.type
  }

  return uploadImageToStorage(imageFile, `images/original/${imageOid}.${imageExt}`, metadata).then((downloadUrl) => {
    log('in here download URL:', downloadUrl)

    const pageImageData = {
      image: {
        filename: `${imageOid}.${imageExt}`,
        ref: downloadUrl,
        created: Date.now()
      }
    }
    let batch = DB.batch()

    if (currentImageOid) {
      let currentImageRef = DB.collection('images').doc(currentImageOid)
      batch.delete(currentImageRef)
    }

    let pageRef = DB.collection('pages').doc(pageOid)
    batch.update(pageRef, pageImageData)

    return batch.commit().then(() => {
      return Promise.resolve({
        filenameKey: pageImageData.image.filename,
        downloadUrl: pageImageData.image.ref
      })
    })
  })
}

export function uploadProfileImage (imageFile, metadata, userOid) {
  log(`Uploading profile image for user oid:[${userOid}]`)

  return uploadImageToStorage(imageFile, `images/profiles/${userOid}/${imageFile.name}`, metadata)
}

export function findImageByOid (imageOid) {
  log(`Finding image by oid:[${imageOid}]`)
  let imageRef = DB.collection('images').doc(imageOid)
  return imageRef.get()
}

export function deleteImage (imageOid) {
  log(`Deleting image by image id/filename:[${imageOid}]`)
  let imageRef = DB.collection('images').doc(imageOid)
  return imageRef.delete()
}
