
/**
 *  This will run when a book record is deleted from the books collection. Any other collection referencing this
 *  record deleted is also deleted. Books uploaded to storage are deleted.
 */
exports.handler = function(change, context, database, storage, bucketName) {
  const pageOid = context.params.pageId;
  console.log(`Page:${pageOid} was updated`);

  const allPromises = []

  const bucket = storage.bucket(bucketName);

  // Get an object representing the document prior to being updated
  const oldValue = change.before.data();
  const newValue = change.after.data();

  console.log('Deleted record:', oldValue);

  // if the page book document was changed then we need to delete the old file from storage
  if (oldValue.book && oldValue.book.filename) {
    if (!newValue.book || (newValue.book.filename && newValue.book.filename !== oldValue.book.filename)) {
      console.log('book file was changed')
      const filename = oldValue.book.filename;
      allPromises.push(removeBooks(bucket, filename))
    }
  }

  // if the page rich text document was changed then we need to delete the old file from storage
  if (oldValue.richText && oldValue.richText.filename) {
    if (!newValue.richText || (newValue.richText.filename && newValue.richText.filename !== oldValue.richText.filename)) {
      console.log('rich text document was changed')
      const filename = oldValue.book.filename;
      allPromises.push(removeRichTexts(bucket, filename))
    }
  }

  return Promise.all(allPromises).then((values) => {
    console.log('all promises complete', values)
    return true
  }).catch((error) => {
    console.log(`Error: There was an error in update page:${pageOid} for all promises`, error)
  })

}

function removeBooks(bucket, bookFilename) {
  const file = bucket.file(`books/${bookFilename}`)
  return deleteFile(file);
}

function removeRichTexts(bucket, richTextFilename) {
  const file = bucket.file(`richTexts/${richTextFilename}`)
  return deleteFile(file);
}

function deleteFile(file) {
  return file.delete()
}
