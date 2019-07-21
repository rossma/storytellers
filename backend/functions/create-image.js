const common = require('./common')

/**
 *  This will run when a preview record is created.
 */
exports.handler = async (newImageDoc, context, database) => {
  console.log(`In onCreateImage - image id:${newImageDoc.id}`)

  const pagesDocs = await common.getPageFromImageOid(database, newImageDoc.id)

  if (pagesDocs.size === 1) {
    console.log('pages doc exists:', pagesDocs.docs[0].id)
    const payloadPart = {
      previewImageUrl: newImageDoc.data().previewUrl,
      imageFilenameOid: newImageDoc.id,
      imageRef: database.doc(`images/${newImageDoc.id}`)
    }
    await common.updatePreviewsByPagesRef(
      database,
      database.doc(`pages/${pagesDocs.docs[0].id}`),
      payloadPart
    )
  }

  return console.log('post image creation tasks complete')
}
