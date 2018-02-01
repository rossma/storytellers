import firebaseApp from '~/firebase/app'

const DB = firebaseApp.firestore()

function findPreviews (previewsRef) {
  return previewsRef.get().then((querySnapshot) => {
    return querySnapshot.docs.map((m) => {
      return {
        id: m.id,
        data: m.data()
      }
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

export function findPreviewsByStory (storyOid) {
  console.log(`[Preview Service] - Finding previews by story:[${storyOid}]`)
  let previewsRef = DB.collection('previews').where('storyOid', '==', storyOid)
  return findPreviews(previewsRef)
}

export function updatePreview (previewOid, preview) {
  console.log(`[Preview Service] - Updating preview:[${previewOid} with:[${preview}]`)
  return DB.collection('previews').doc(previewOid).set(preview, { merge: true })
}

export function addPreview (preview) {
  console.log(`[Preview Service] - Adding preview:[${preview}]`)
  return DB.collection('previews').add(preview)
}
