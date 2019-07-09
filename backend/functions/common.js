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

  updatePreviewsByPageOid: function(database, pagesRef, payloadPart) {
    console.log(
      `Updating previews collection by page oid:[${pagesRef.data().id}]`
    )
    return database
      .collection('previews')
      .where('pagesRef', '==', pagesRef)
      .set(payloadPart, { merge: true })
  },

  getPageFromImageFilename: async function(database, filename) {
    const pagesRef = database
      .collection('pages')
      .where('image.filename', '==', filename)
      .limit(1)
    const pagesDoc = await pagesRef.get()
    return pagesDoc
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
