const commonDB = require('./common-database')

const BATCH_SIZE = 100

/**
 *  This will run when a story record is deleted from the stories collection. Any other collection referencing this
 *  record deleted is also deleted
 */
exports.handler = async (snap, context, database) => {
  console.log(`In onDeleteStory`)

  const storyOid = context.params.storyId
  console.log(`Story:${storyOid} was deleted`)

  // Get an object representing the document prior to deletion
  // const deletedValue = event.data.previous.data();
  const deletedValue = snap.data()
  console.log('Deleted record:', deletedValue)

  const pagesRef = database
    .collection('pages')
    .where('storyOid', '==', storyOid)
  await commonDB.deleteCollection(database, pagesRef, BATCH_SIZE)
  console.log('pages deleted')

  const chaptersRef = database
    .collection('chapters')
    .where('storyOid', '==', storyOid)
  await commonDB.deleteCollection(database, chaptersRef, BATCH_SIZE)
  console.log('chapters deleted')

  const previewsRef = database
    .collection('previews')
    .where('storyOid', '==', storyOid)
  await commonDB.deleteCollection(database, previewsRef, BATCH_SIZE)

  const coverImageFilename = determineCoverImageFilename(deletedValue)
  if (coverImageFilename) {
    const imagesRef = database
      .collection('images')
      .where('filename', '==', coverImageFilename)
    await commonDB.deleteCollection(database, imagesRef, BATCH_SIZE)
  }

  return console.log('post story deletion tasks complete')
}

function determineCoverImageFilename(deletedValue) {
  if (deletedValue.cover && deletedValue.cover.imageFilename) {
    return deletedValue.cover.imageFilename
  } else {
    return null
  }
}
