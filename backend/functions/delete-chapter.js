const commonDB = require('./common-database')

const BATCH_SIZE = 100

/**
 *  This will run when a record is deleted from the chapters collection. All page collections that reference this
 *  chapter are also deleted.
 */
exports.handler = async (snap, context, database) => {
  const chapterOid = context.params.chapterId
  console.log(`Chapter:${chapterOid} was deleted`)

  const deletedValue = snap.data()
  console.log('Deleted record:', deletedValue)

  const pagesRef = database
    .collection('pages')
    .where('chapterOid', '==', chapterOid)
  await commonDB.deleteCollection(database, pagesRef, BATCH_SIZE)

  return console.log('post delete chapter tasks complete')
}
