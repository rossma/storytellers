/**
 *  Common database functions
 */
module.exports = {
  deleteCollection: function (db, collectionRef, batchSize) {
    var query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise(function (resolve, reject) {
      deleteQueryBatch(db, query, batchSize, resolve, reject);
    });
  },
};

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
