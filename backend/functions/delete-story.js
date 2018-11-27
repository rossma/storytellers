const commonDB = require('./database-common');

const BATCH_SIZE = 100;

/**
 *  This will run when a story record is deleted from the stories collection. Any other collection referencing this
 *  record deleted is also deleted
 */
exports.handler = function(snap, context, database) {
  // const storyOid = event.params.storyId;
  const storyOid = context.params.storyId;
  console.log(`Story:${storyOid} was deleted`);

  // Get an object representing the document prior to deletion
  // const deletedValue = event.data.previous.data();
  const deletedValue = snap.data();
  console.log('Deleted record:', deletedValue);

  let pagesRef = database.collection('pages').where('storyOid', '==', storyOid);
  return commonDB.deleteCollection(database, pagesRef, BATCH_SIZE).then(() => {
    console.log('pages deleted');
    let chaptersRef = database.collection('chapters').where('storyOid', '==', storyOid);
    return commonDB.deleteCollection(database, chaptersRef, BATCH_SIZE);
  }).then(() => {
    console.log('chapters deleted');
    let previewsRef = database.collection('previews').where('storyOid', '==', storyOid);
    return commonDB.deleteCollection(database, previewsRef, BATCH_SIZE);
  }).then(() => {
    console.log('previews deleted');
    const coverImageFilename = determineCoverImageFilename(deletedValue);
    if (coverImageFilename) {
      let imagesRef = database.collection('images').where('filename', '==', coverImageFilename);
      return commonDB.deleteCollection(database, imagesRef, BATCH_SIZE);
    } else {
      return Promise.resolve();
    }
  }).then(() => {
    console.log('story and all referenced documents deleted');
    return true;
  }).catch((error) => {
    console.log(`Error: There was an error running the onDeleteStory function for story:${storyOid}`, error);
  });
}

function determineCoverImageFilename(deletedValue) {
  if (deletedValue.cover && deletedValue.cover.imageFilename) {
    return deletedValue.cover.imageFilename;
  } else {
    return null;
  }
}
