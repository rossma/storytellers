// import firebaseApp from 'fire/app'
import { DB } from 'fire/app'
import debug from 'debug'
const log = debug('app:api/service/page')

function findPages (pagesRef) {
  return pagesRef.get().then((querySnapshot) => {
    return querySnapshot.docs.map((m) => {
      const page = {
        id: m.id,
        chapterOid: m.data().chapterOid,
        page: m.data().page,
        public: m.data().public,
        storyOid: m.data().storyOid,
        uid: m.data().uid,
        image: { ...m.data().image },
        book: { ...m.data().book }
      }
      log('page:', page)
      return page
    })
  })
}

export function findPagesByUser (userOid) {
  log(`Finding pages by user:[${userOid}]`)
  return findPages(DB.collection('pages').where('uid', '==', userOid))
}

export function findPagesByStory (storyOid) {
  log(`Finding pages by story:[${storyOid}]`)
  return findPages(DB.collection('pages').where('storyOid', '==', storyOid))
}

export function findPageByOid (pageOid) {
  log(`Finding page by oid:[${pageOid}]`)
  let pagesRef = DB.collection('pages').doc(pageOid)
  return pagesRef.get()
}

export function addPage (page) {
  log(`Adding page:[${JSON.stringify(page)}]`)
  return DB.collection('pages').add(page)
}

export function updatePage (pageOid, page) {
  log(`Updating page:[${pageOid} with:[${JSON.stringify(page)}]`)
  return DB.collection('pages').doc(pageOid).set(page, { merge: true })
}

export function publishPage (preview) {
  log(`Publishing page:[${preview.pageOid} for story:[${preview.storyOid}]}]`)

  let batch = DB.batch()
  let pageRef = DB.collection('pages').doc(preview.pageOid)
  batch.update(pageRef, { public: true })

  let previewsRef = DB.collection('previews').doc()
  batch.set(previewsRef, preview)

  return batch.commit()
}

export function deletePage (pageOid) {
  log(`Deleting page:[${pageOid}]`)
  let pageRef = DB.collection('pages').doc(pageOid)
  return pageRef.delete()
}
