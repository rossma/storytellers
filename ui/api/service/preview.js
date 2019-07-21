// import firebaseApp from 'fire/app'
import { DB } from 'fire/app'
import debug from 'debug'
const log = debug('app:api/service/preview')

function findPreviews(previewsRef) {
  return previewsRef.get().then(querySnapshot => {
    return querySnapshot.docs.map(m => {
      return {
        id: m.id,
        chapterOid: m.data().chapterOid,
        imageFilenameOid: m.data().imageFilenameOid,
        pageOid: m.data().pageOid,
        pagesRef: m.data().pagesRef,
        previewImageUrl: m.data().previewImageUrl,
        wallpaperUrl: m.data().wallpaperUrl,
        storyOid: m.data().storyOid,
        summary: m.data().summary,
        title: m.data().title,
        uid: m.data().uid,
        userDisplayName: m.data().userDisplayName,
        usersRef: m.data().usersRef,
        invite: m.data().invite,
        parentPagesRef: m.data().parentPagesRef
      }
    })
  })
}

export function findPreviewsByFilter(filterBy) {
  log(`Finding previews by filter:[${JSON.stringify(filterBy)}]`)
  let previewsRef = DB.collection('previews').orderBy('created', 'desc')
  if (filterBy.byAuthorUid) {
    previewsRef = previewsRef.where('uid', '==', filterBy.byAuthorUid)
  }
  if (filterBy.byKeywords) {
    previewsRef = previewsRef.where(
      'keywords',
      'array-contains',
      filterBy.byKeywords
    )
  }
  return findPreviews(previewsRef)
}

export function findPreviewsByStory(storyOid) {
  log(`Finding previews by story:[${storyOid}]`)
  const previewsRef = DB.collection('previews').where(
    'storyOid',
    '==',
    storyOid
  )
  return findPreviews(previewsRef)
}

export function updatePreview(previewOid, preview) {
  log(`Updating preview:[${previewOid} with:[${preview}]`)
  return DB.collection('previews')
    .doc(previewOid)
    .set(preview, { merge: true })
}

export function addPreview(preview) {
  log(`Adding preview:[${preview}]`)
  return DB.collection('previews').add(preview)
}
