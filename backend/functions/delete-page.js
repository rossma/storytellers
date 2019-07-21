const common = require('./common')
const commonDB = require('./common-database')

const BATCH_SIZE = 100

/**
 *  This will run when a page record is deleted from the pages collection. Any other collection referencing this
 *  record deleted is also deleted. Any files uploaded to storage that belong to this page are deleted.
 */
exports.handler = async (snap, context, database, storage, bucketName) => {
  const pageOid = context.params.pageId
  console.log(`Page:${pageOid} was deleted`)

  const deletedValue = snap.data()
  console.log('Deleted record:', deletedValue)

  const bucket = storage.bucket(bucketName)

  const bookFilename = common.getBookFilename(deletedValue.book)
  console.log(`bookFilename:${bookFilename}`)
  if (bookFilename) {
    await removeFile(bucket, 'books', bookFilename)
  }

  const richTextsFilename = common.getRichTextFilename(deletedValue.richText)
  console.log(`richTextsFilename:${richTextsFilename}`)
  if (richTextsFilename) {
    await removeFile(bucket, 'richTexts', richTextsFilename)
  }

  const imageFilename = common.getImageFilename(deletedValue.image)
  console.log(`imageFilename:${imageFilename}`)
  if (imageFilename) {
    await common.deleteImageFromDB(database, imageFilename)
  }

  if (common.pageIsCoverToStory(database, pageOid, imageFilename)) {
    console.log('Page image is cover story')
    if (deletedValue.storyOid) {
      await common.updateStoryCoverImage(database, deletedValue.storyOid)
    }
  }

  if (deletedValue.parentPagesRef) {
    console.log(`Page document is child record:${deletedValue.parentPagesRef}`)
    // do nothing?
  }

  const previewsRef = database
    .collection('previews')
    .where('pageOid', '==', pageOid)
  await commonDB.deleteCollection(database, previewsRef, BATCH_SIZE)

  return console.log('post page deletion tasks complete')
}

function removeFile(bucket, path, filename) {
  const file = bucket.file(`${path}/${filename}`)
  return file.delete()
}
