const commonDB = require('./database-common');

const BATCH_SIZE = 100;

/**
 *  This will run when a page record is deleted from the pages collection. Any other collection referencing this
 *  record deleted is also deleted. Any files uploaded to storage that belong to this page are deleted.
 */
exports.handler = function(event, database) {
  const pageOid = event.params.pageId;
  console.log(`Page:${pageOid} was deleted`);

  const deletedValue = event.data.previous.data();
  console.log('Deleted record:', deletedValue);

  let imageFilename = getImageFilename(deletedValue.image);
  console.log(`imageFilename:${imageFilename}`);

  return deleteImageFromDB(database, imageFilename).then(() => {
    console.log('image deletion complete');
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

function deleteImageFromDB(database, imageFilename) {
  if (imageFilename) {
    return database.collection('images').doc(imageFilename).delete();
  } else {
    console.log('Image filename is empty there nothing to delete');
    return Promise.resolve();
  }
}
