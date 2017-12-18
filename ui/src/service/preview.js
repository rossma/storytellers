import firebaseApp from '~/firebaseApp'

const DB = firebaseApp.firestore()

function findPreviews (previewsRef) {
  return previewsRef.get().then((querySnapshot) => {
    return querySnapshot.docs.map((m) => {
      let preview = {
        id: m.id,
        data: m.data()
      }
      return preview
    })
  })
}

export function findPreviewsByFilter (filterBy) {
  console.log(`[Preview Service] - Finding previews by filter:[${JSON.stringify(filterBy)}]`)
  let previewsRef = DB.collection('previews')
  if (filterBy.byAuthorUid) {
    previewsRef = previewsRef.where('uid', '==', filterBy.byAuthorUid)
  }
  return findPreviews(previewsRef)
}

export function addPreview (preview) {
  console.log(`[Preview Service] - Adding preview:[${preview}]`)
  return DB.collection('previews').add(preview)
}
