module.exports = {
  getUser: async function(database, uid) {
    const userDoc = await database
      .collection('users')
      .doc(uid)
      .get()
    return userDoc.data()
  },

  getStoryByOid: function(database, storyOid) {
    const storyDoc = database
      .collection('stories')
      .doc(storyOid)
      .get()
    return storyDoc
  },

  updatePage: function(database, pageOid, page) {
    console.log(`Updating page:[${pageOid} with:[${JSON.stringify(page)}]`)
    return database
      .collection('pages')
      .doc(pageOid)
      .set(page, { merge: true })
  },

  updatePreviewsByPagesRef: function(database, pagesRef, payloadPart) {
    console.log(`Updating previews collection`, pagesRef)
    database
      .collection('previews')
      .where('pagesRef', '==', pagesRef)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          console.log(`Updating preview doc:[${doc.id}]`)
          doc.ref.update(payloadPart)
        })
      })
      .catch(error => {
        console.log('Error getting previews and updating them:', error)
      })
  },

  getPageFromImageOid: async function(database, imageOid) {
    const pagesRef = database
      .collection('pages')
      .where('image.filename', '==', imageOid)
      .limit(1)
    const pagesDocs = await pagesRef.get()
    return pagesDocs
  },

  getImagePreviewUrl: async function(database, imageOid) {
    //     const doc_ref = await db.collection(my_collection).add(doc).catch(err => { ... })
    try {
      const imageRef = database.collection('images').doc(imageOid)
      const imageDoc = await imageRef.get()
      return imageDoc.data().previewUrl
    } catch (rejectedValue) {
      console.log(
        `There was an error fetching image from oid:[${imageOid}]`,
        rejectedValue
      )
      return null
    }
  },

  getBookFilename: function(book) {
    if (book && book.filename) {
      return book.filename
    } else {
      return null
    }
  },

  getRichTextFilename: function(richText) {
    if (richText && richText.filename) {
      return richText.filename
    } else {
      return null
    }
  },

  getImageFilename: function(image) {
    if (image && image.filename) {
      return image.filename
    } else {
      return null
    }
  },

  pageIsCoverToStory: async function(database, pageOid, imageFilename) {
    console.log(`Looking up story for page:${pageOid}`)
    const storyRef = database.collection('stories').doc(pageOid)
    const storyDoc = await storyRef.get()
    return (
      storyDoc.exists &&
      storyDoc.data.cover &&
      storyDoc.data.cover.imageFilename === imageFilename
    )
  },

  updateStoryCoverImage: function(database, storyOid) {
    console.log(`Setting story cover image to blank`)
    return database
      .collection('stories')
      .doc(storyOid)
      .set({ cover: {} }, { merge: true })
  },

  deleteImageFromDB: function(database, imageFilename) {
    if (imageFilename) {
      return database
        .collection('images')
        .doc(imageFilename)
        .delete()
    } else {
      console.log('Image filename is empty there nothing to delete')
      return Promise.resolve()
    }
  }
}
