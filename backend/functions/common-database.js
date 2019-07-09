/**
 *  Common database functions
 */
module.exports = {
  deleteCollection: function(db, collectionRef, batchSize) {
    const query = collectionRef.orderBy('__name__').limit(batchSize)

    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, batchSize, resolve, reject)
    })
  }
}

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query
    .get()
    .then(snapshot => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0
      }

      // Delete documents in a batch
      const batch = db.batch()
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      return batch.commit().then(() => {
        return snapshot.size
      })
    })
    .then(numDeleted => {
      if (numDeleted <= batchSize) {
        resolve()
      } else {
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          deleteQueryBatch(db, query, batchSize, resolve, reject)
        })
      }
      return true
    })
    .catch(reject)
}
