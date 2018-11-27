import 'firebase/storage' // this is needed if page is refreshed otherwise error is thrown: ...storage() is not a function
import firebaseApp from '~/firebase/app'

const uuidv4 = require('uuid/v4')
const DB = firebaseApp.firestore()
const STORAGE = firebaseApp.storage()
const STORAGE_REF = STORAGE.ref()

function uploadImageToStorage (file, path, metadata) {
  console.log(`[Image Service] - Uploading image:[${path}] to storage`)
  let uploadTask = STORAGE_REF.child(path).put(file, metadata)

  return uploadTask.then((snapshot) => {
    console.log('[Image Service] - Uploaded', snapshot.totalBytes, 'bytes.')
    console.log('[Image Service] - Metadata:', snapshot.metadata)
    console.log('[Image Service] - DownloadURL:', snapshot.downloadURL)
    return snapshot.ref.getDownloadURL()
  })
}

export function uploadPageImage (pageOid, currentImageOid, imageFile) {
  console.log(`[Image Service] - Upload page image for page oid:[${pageOid}]`)

  const imageOid = uuidv4()
  const imageExt = imageFile.name.split('.').pop()

  let metadata = {
    'contentType': imageFile.type
  }

  return uploadImageToStorage(imageFile, `images/original/${imageOid}.${imageExt}`, metadata).then((downloadUrl) => {
    console.log('in here download URL:', downloadUrl)

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
  console.log(`[Image Service] - Uploading profile image for user oid:[${userOid}]`)

  return uploadImageToStorage(imageFile, `images/profiles/${userOid}/${imageFile.name}`, metadata)
}

export function findImageByOid (imageOid) {
  console.log(`[Image Service] - Finding image by oid:[${imageOid}]`)
  let imageRef = DB.collection('images').doc(imageOid)
  return imageRef.get()
}

export function deleteImage (imageOid) {
  console.log(`[Image Service] - Deleting image by image id/filename:[${imageOid}]`)
  let imageRef = DB.collection('images').doc(imageOid)
  return imageRef.delete()
}
