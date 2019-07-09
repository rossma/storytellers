/**
 *  This will run when a preview record is created.
 */
exports.handler = async (snap, context, database) => {
  console.log(`In onCreatePreview`)

  const newPreview = snap.data()

  // access a particular field as you would any JS property
  const pageOid = newPreview.pageOid
  console.log(`Preview id:${snap.id} PageOid:${pageOid}`)

  // update pages document to include previews id
  await database
    .collection('pages')
    .doc(pageOid)
    .update({
      previewsRef: database.doc(`previews/${snap.id}`),
      invite: newPreview.invite
    })

  return console.log('post preview creation tasks complete')
}
