import { DB } from 'fire/app'
import debug from 'debug'
import { uploadFileToStorage } from './storage'

const log = debug('app:api/service/image')

export function uploadPageImage(pageOid, currentImageOid, imageFile) {
  log(
    `Upload page image for page oid:[${pageOid}] current image oid:[${currentImageOid}]`
  )

  return uploadImage(imageFile).then(result => {
    log('in here download image URL:', result)

    const pageImageData = {
      image: {
        filename: result.filename,
        ref: result.downloadUrl,
        created: Date.now()
      }
    }
    const batch = DB.batch()

    if (currentImageOid) {
      const currentImageRef = DB.collection('images').doc(currentImageOid)
      batch.delete(currentImageRef)
    }

    const pagesRef = DB.collection('pages').doc(pageOid)
    batch.update(pagesRef, pageImageData)

    return batch.commit().then(() => {
      return Promise.resolve({
        filenameKey: pageImageData.image.filename,
        downloadUrl: pageImageData.image.ref
      })
    })
  })
}

export function uploadImage(imageFile) {
  log(`Uploading image`)
  return uploadFileToStorage(imageFile, 'images/original')
}

export function uploadProfileImage(imageFile, userOid) {
  log(`Uploading profile image for user oid:[${userOid}]`)
  return uploadFileToStorage(imageFile, `images/profiles/${userOid}`)
}

export function findImageByOid(imageOid) {
  log(`Finding image by oid:[${imageOid}]`)
  const imageRef = DB.collection('images').doc(imageOid)
  return imageRef.get()
}

export function deleteImage(imageOid) {
  log(`Deleting image by image id/filename:[${imageOid}]`)
  const imageRef = DB.collection('images').doc(imageOid)
  return imageRef.delete()
}
