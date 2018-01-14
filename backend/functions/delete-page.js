const commonDB = require('./database-common');

const BATCH_SIZE = 100;
const BASE_ORIG_FILE_PATH = 'images/original'
const BASE_236X_FILE_PATH = 'images/236x'

/**
 *  This will run when a page record is deleted from the pages collection. Any other collection referencing this
 *  record deleted is also deleted. Any files uploaded to storage that belong to this page are deleted.
 */
exports.handler = function(event, database, storage, bucketName) {
  const pageOid = event.params.pageId;
  console.log(`Page:${pageOid} was deleted`);

  const deletedValue = event.data.previous.data();
  console.log('Deleted record:', deletedValue);

  const bucket = storage.bucket(bucketName);

  let imageFilename = getImageFilename(deletedValue.image);
  return removePageImagesFromStorage(bucket, imageFilename).then(() => {
    return pageIsCoverToStory(database, pageOid, imageFilename);
  }).then((isCover) => {
    if (isCover) {
      console.log('Page image is cover story');
      return updateStoryCoverImage(database, deletedValue.storyOid);
    } else {
      console.log('Page image is not cover story');
      return Promise.resolve();
    }
  }).then(() => {
    console.log('Story cover updated');
    let previewsRef = database.collection('previews').where('pageOid', '==', pageOid);
    return commonDB.deleteCollection(database, previewsRef, BATCH_SIZE);
  }).then(() => {
    console.log('Preview deleted');
  }).catch((error) => {
    console.log(`Error: There was an error in the onDeletePage function for page:${pageOid}`, error);
  });
}

function getImageFilename(image) {
  if (image && image.filename) {
    return image.filename;
  } else {
    return null;
  }
}

function pageIsCoverToStory(database, pageOid, imageFilename) {
  console.log(`Looking up story for page:${pageOid}`);
  let storyRef = database.collection('stories').doc(pageOid);
  return storyRef.get().then((storyDoc) => {
    if (storyDoc.exists && storyDoc.data.cover && storyDoc.data.cover.imageFilename === imageFilename) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  });
}

function updateStoryCoverImage(database, storyOid) {
  console.log(`Setting story cover image to blank`);
  return database.collection('stories').doc(storyOid).set({cover: {}}, { merge: true })
}

function removePageImagesFromStorage(bucket, imageFilename) {
  if (imageFilename) {
    const origFile = bucket.file(`${BASE_ORIG_FILE_PATH}/${imageFilename}`)
    return deleteFileFromStorage(origFile).then(() => {
      const thumb236xFile = bucket.file(`${BASE_236X_FILE_PATH}/${imageFilename}`)
      return deleteFileFromStorage(thumb236xFile);
    });
  } else {
    console.log('Image filename is undefined');
    return Promise.resolve();
  }
}

function deleteFileFromStorage(file) {
  return file.delete();
}
