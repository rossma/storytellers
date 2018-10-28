const BASE_ORIG_FILE_PATH = 'images/original'
const BASE_236X_FILE_PATH = 'images/236x'

/**
 *  This will run when an image record is deleted from the images collection. Any other collection referencing this
 *  record deleted is also deleted. Images uploaded to storage are deleted.
 */
exports.handler = function(snap, context, database, storage, bucketName) {
  const imageOid = context.params.imageId;
  console.log(`Image:${imageOid} was deleted`);

  // Get an object representing the document prior to deletion
  const deletedValue = snap.data();
  console.log('Deleted record:', deletedValue);
  const imageFilename = deletedValue.filename;

  const bucket = storage.bucket(bucketName);
  return removeImages(bucket, imageFilename).then(() => {
    console.log('images removed from storage');
    return true;
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
