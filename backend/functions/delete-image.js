const BATCH_SIZE = 100;
const BASE_ORIG_FILE_PATH = 'images/original'
const BASE_236X_FILE_PATH = 'images/236x'

/**
 *  This will run when an image record is deleted from the images collection. This will happen when a user replaces
 *  an image with another one.
 *
 *  Uploaded files to storage are removed
 */
exports.handler = function(event, database, storage, bucketName) {
  const imageOid = event.params.imageId;
  console.log(`Image:${imageOid} was deleted`);

  // Get an object representing the document prior to deletion
  const deletedValue = event.data.previous.data();
  console.log('Deleted record:', deletedValue);
  const imageFilename = deletedValue.filename;

  const bucket = storage.bucket(bucketName);
  return removeImages(bucket, imageFilename).then(() => {
    console.log('images removed from storage');
  }).catch((error) => {
    console.log(`Error: There was an error removing image:${imageOid} from storage`, error);
  });
}

function removeImages(bucket, imageFilename) {
  const origFile = bucket.file(`${BASE_ORIG_FILE_PATH}/${imageFilename}`)
  return deleteFile(origFile).then(() => {
    const thumb236xFile = bucket.file(`${BASE_236X_FILE_PATH}/${imageFilename}`)
    return deleteFile(thumb236xFile);
  });
}

function deleteFile(file) {
  return file.delete();
}