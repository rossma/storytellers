const common = require('./common')

/**
 *  This will run when a record is created in the pages collection.
 */
exports.handler = async (newPagesDoc, context, database) => {
  console.log(`In onCreatePages:[${newPagesDoc.id}]`)

  if (newPagesDoc.data().parentPagesRef) {
    console.log(`Page document is child record`)

    const usersRef = database.collection('users').doc(newPagesDoc.data().uid)
    const usersDoc = await usersRef.get()
    const user = usersDoc.data()
    console.log('user data:', user)

    const parentPagesRef = newPagesDoc.data().parentPagesRef
    console.log('parent pages ref:', parentPagesRef)

    const parentPagesDoc = await parentPagesRef.get()
    console.log('parents pages data:', parentPagesDoc.data())

    const storyOid = parentPagesDoc.data().storyOid
    const storiesRef = database.collection('stories').doc(storyOid)
    const storiesDoc = await storiesRef.get()

    const pagesRef = database.collection('pages').doc(newPagesDoc.id)

    const pageImage = newPagesDoc.data().image

    console.log('pageImage:', pageImage)
    let imageOid = ''
    let imagePreviewUrl = ''
    if (pageImage && pageImage.filename) {
      const imagesRef = database.collection('images').doc(pageImage.filename)
      const imageDoc = await imagesRef.get()
      if (imageDoc.exists) {
        console.log('Image Document exists:', imageDoc.data())
        imageOid = imageDoc.id
        imagePreviewUrl = imageDoc.data().previewUrl
      } else {
        console.log("Image document doesn't exist")
      }
    }

    console.log('story data:', storiesDoc.data())
    console.log('newPagesDoc1:', newPagesDoc.id)

    // save record in the previews collection
    const preview = {
      storyOid: storyOid,
      storiesRef: storiesRef,
      // chapterOid: chapterDoc.data().id,
      // chapterRef: parentPagesRef.data().chapterRef,
      pageOid: newPagesDoc.id,
      pagesRef: pagesRef,
      parentPagesRef: newPagesDoc.data().parentPagesRef,
      title: storiesDoc.data().title,
      summary: newPagesDoc.data().summary,
      uid: user.uid,
      usersRef: usersRef,
      userDisplayName: user.displayName || '',
      previewImageUrl: imagePreviewUrl,
      imageFilenameOid: imageOid,
      created: Date.now(),
      keywords: newPagesDoc.data().keywords,
      authorTags: newPagesDoc.data().authorTags,
      invite: false,
      wallpaperUrl: newPagesDoc.data().wallpaperUrl
    }

    const previewsRef = await database.collection('previews').add(preview)
    console.log(`Previews document created:[${previewsRef.id}]`)
  }

  return console.log('post page creation tasks complete')
}
