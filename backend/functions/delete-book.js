
/**
 *  This will run when a book record is deleted from the books collection. Any other collection referencing this
 *  record deleted is also deleted. Books uploaded to storage are deleted.
 */
exports.handler = function(snap, context, database, storage, bucketName) {
  const bookOid = context.params.bookId;
  console.log(`Book:${bookOid} was deleted`);

  // Get an object representing the document prior to deletion
  const deletedValue = snap.data();
  console.log('Deleted record:', deletedValue);
  const bookFilename = deletedValue.filename;

  const bucket = storage.bucket(bucketName);
  return removeBooks(bucket, bookFilename).then(() => {
    console.log('books removed from storage');
    return true;
  }).catch((error) => {
    console.log(`Error: There was an error removing book:${bookOid} from storage`, error);
  });
}

function removeBooks(bucket, bookFilename) {
  const file = bucket.file(`books/${bookFilename}`)
  return deleteFile(file);
}

function deleteFile(file) {
  return file.delete();
}
