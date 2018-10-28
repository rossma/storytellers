const commonDB = require('./database-common');

const BATCH_SIZE = 100;

/**
 *  This will run when a record is deleted from the chapters collection. All page collections that reference this
 *  chapter are also deleted.
 */
exports.handler = function(snap, context, database) {
  const chapterOid = context.params.chapterId;
  console.log(`Chapter:${chapterOid} was deleted`);

  const deletedValue = snap.data();
  console.log('Deleted record:', deletedValue);

  let pagesRef = database.collection('pages').where('storyOid', '==', deletedValue.storyOid);
  return commonDB.deleteCollection(database, pagesRef, BATCH_SIZE).then(() => {
    console.log('pages deleted');
    return true;
  }).catch((error) => {
    console.log(`Error: There was an error in onDeleteChapter function for chapter:${chapterOid}`, error);
  });
}
