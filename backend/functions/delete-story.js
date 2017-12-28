const BATCH_SIZE = 100;
const BASE_ORIG_FILE_PATH = 'images/original'
const BASE_236X_FILE_PATH = 'images/236x'

/**
 *  This will run when a story record is deleted from the stories collection
 *
 *  Data cleanup is performed in this function by removing rows from other referenced documents
 *  Uploaded files to storage are also removed
 *
 *  https://firebase.google.com/docs/firestore/extend-with-functions
 */
exports.handler = function(event, database, storage, bucketName) {
  const storyOid = event.params.storyId;
  console.log(`Story:${storyOid} was deleted`);

  // Get an object representing the document prior to deletion
  const deletedValue = event.data.previous.data();
  console.log('Deleted record:', deletedValue);
  const coverImageFilename = determineCoverImageFilename(deletedValue);

  const bucket = storage.bucket(bucketName);

  let pagesRef = database.collection('pages').where('storyOid', '==', storyOid);
  return pagesRef.get().then((pageSnapshot) => {
    pageSnapshot.forEach((page) => {
      if (page.data.image && page.data.image.filename) {
        removePageImages(bucket, page.data.image.filename);
      }
    });
    return deleteCollection(database, pagesRef, BATCH_SIZE);;
  }).then(() => {
    console.log('pages deleted');
    let chaptersRef = database.collection('chapters').where('storyOid', '==', storyOid);
    return deleteCollection(database, chaptersRef, BATCH_SIZE);
  }).then(() => {
    console.log('chapters deleted');
    let previewsRef = database.collection('previews').where('storyOid', '==', storyOid);
    return deleteCollection(database, previewsRef, BATCH_SIZE);
  }).then(() => {
    console.log('previews deleted');
    if (coverImageFilename) {
      let imagesRef = database.collection('images').where('filename', '==', coverImageFilename);
      return deleteCollection(database, imagesRef, BATCH_SIZE);
    } else {
      return Promise.resolve();
    }
  }).then(() => {
    if (coverImageFilename) {
      console.log(`cover image:${coverImageFilename} record deleted from DB`);
      let coverImageFile = bucket.file(`${BASE_ORIG_FILE_PATH}/${coverImageFilename}`)
      deleteFile(coverImageFile).then(() => {
        console.log('Cover image file successfully deleted');
      }).catch((error) => {
        console.log(`Error deleting cover image:${coverImageFile}`, error);
      });
    }
    return Promise.resolve();
  }).then(() => {
    console.log('story and all referenced documents deleted');
  }).catch((error) => {
    console.log(`Error: There was an error deleting story:${storyOid}`, error);
  });
}

function deleteCollection (db, collectionRef, batchSize) {
  var query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise(function (resolve, reject) {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

function deleteQueryBatch (db, query, batchSize, resolve, reject) {
  query.get().then((snapshot) => {
    // When there are no documents left, we are done
    if (snapshot.size === 0) {
      return 0;
    }

    // Delete documents in a batch
    var batch = db.batch();
    snapshot.docs.forEach(function (doc) {
      batch.delete(doc.ref);
    });

    return batch.commit().then(function () {
      return snapshot.size;
    });
  }).then(function (numDeleted) {
    if (numDeleted <= batchSize) {
      resolve();
      return;
    }

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(function () {
      deleteQueryBatch(db, query, batchSize, resolve, reject);
    });
  }).catch(reject);
}

function determineCoverImageFilename(deletedValue) {
  if (deletedValue.cover && deletedValue.cover.imageFilename) {
    return deletedValue.cover.imageFilename;
  } else {
    return null;
  }
}

function removePageImages(bucket, imageFilename) {
  const origFile = bucket.file(`${BASE_ORIG_FILE_PATH}/${imageFilename}`)
  deleteFile(origFile).then(() => {
    const thumb236xFile = bucket.file(`${BASE_236X_FILE_PATH}/${imageFilename}`)
    return deleteFile(thumb236xFile);
  }).then(() => {
    console.log(`Successfully deleted files`);
  }).catch(error => {
    console.log(`Failed to remove files`, error);
  });
}

function deleteFile(file) {
  return file.delete();
}