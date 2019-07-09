const common = require('./common')

/**
 *  This will run when a preview record is created.
 */
exports.handler = async (newImageDoc, context, database) => {
  console.log(`In onCreateImage`)

  // access a particular field as you would any JS property
  const filename = newImageDoc.data().filename
  console.log(`Image file name:${filename}`)

  const pagesDoc = common.getPageFromImageFilename(database, filename)

  if (pagesDoc && pagesDoc.exists) {
    console.log('pages doc exists:', pagesDoc.id)
    const payloadPart = {
      previewImageUrl: newImageDoc.data().previewUrl,
      imageFilenameOid: newImageDoc.id,
      imageRef: newImageDoc.data().ref
    }
    const previewsRef = await common.updatePreviewsByPageOid(
      database,
      pagesDoc.data().ref,
      payloadPart
    )
    console.log(`Previews document created:[${previewsRef.id}]`)
  }

  return console.log('post image creation tasks complete')
}
