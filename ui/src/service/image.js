import 'firebase/storage' // this is needed if page is refreshed otherwise error is thrown: ...storage() is not a function

import firebaseApp from '~/firebaseApp'

const DB = firebaseApp.firestore()
const STORAGE_REF = firebaseApp.storage().ref()

function uploadImageToStorage (file, path, metadata) {
  console.log(`[Image Service] - Uploading image:[${path}] to storage`)
  return STORAGE_REF.child(path)
    .put(file, metadata).then((snapshot) => {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.')
      console.log('Metadata:', snapshot.metadata)
      console.log('downloadURL:', snapshot.downloadURL)
      return snapshot.downloadURL
    })
}

export function uploadStoryImage (imageFile, metadata, imageOid) {
  return uploadImageToStorage(imageFile, `images/original/${imageOid}.${imageFile.name.split('.').pop()}`, metadata)
}

export function uploadProfileImage (imageFile, metadata, userOid) {
  return uploadImageToStorage(imageFile, `images/profiles/${userOid}/${imageFile.name}`, metadata)
}

export function findImageByOid (imageOid) {
  console.log(`[Image Service] - Finding image by oid:[${imageOid}]`)
  let imageRef = DB.collection('images').doc(imageOid)
  return imageRef.get()
}
