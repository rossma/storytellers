// import firebaseApp from 'fire/app'
import { DB } from 'fire/app'

import debug from 'debug'
const log = debug('app:api/service/page')

function findPages(pagesRef) {
  return pagesRef.get().then(querySnapshot => {
    return querySnapshot.docs.map(m => {
      const page = {
        id: m.id,
        chapterOid: m.data().chapterOid,
        page: m.data().page,
        invite: m.data().invite,
        public: m.data().public,
        storyOid: m.data().storyOid,
        uid: m.data().uid,
        image: { ...m.data().image },
        book: { ...m.data().book },
        richText: { ...m.data().richText },
        parentPagesOid: m.data().parentPagesOid,
        // parentPagesRef: m.data().parentPagesRef,
        parentPagesRef: `pages/${m.data().parentPagesOid}`,
        summary: m.data().summary
      }
      log('page:', page)
      return page
    })
  })
}

export function findPagesByParent(parentPagesRef) {
  log(`Finding pages by parent page:[${parentPagesRef.id}]`)
  return findPages(
    DB.collection('pages').where('parentPagesRef', '==', parentPagesRef)
  )
}

export function findPagesByUser(userOid) {
  log(`Finding pages by user:[${userOid}]`)
  return findPages(DB.collection('pages').where('uid', '==', userOid))
}

export function findPagesByStory(storyOid) {
  log(`Finding pages by story:[${storyOid}]`)
  return findPages(DB.collection('pages').where('storyOid', '==', storyOid))
}

export function findPageByOid(pageOid) {
  log(`Finding page by oid:[${pageOid}]`)
  const pagesRef = DB.collection('pages').doc(pageOid)
  return pagesRef.get()
}

export function addPage(page) {
  log(`Adding page:[${JSON.stringify(page)}]`)
  if (page.parentPagesOid) {
    page.parentPagesRef = DB.doc(`pages/${page.parentPagesOid}`)
  }
  return DB.collection('pages').add(page)
}

export function updatePage(pageOid, page) {
  log(`Updating page:[${pageOid} with:[${JSON.stringify(page)}]`)
  return DB.collection('pages')
    .doc(pageOid)
    .set(page, { merge: true })
}

export function publishPage(preview) {
  log(`Publishing page:[${preview.pageOid} for story:[${preview.storyOid}]}]`)

  const batch = DB.batch()
  const pagesRef = DB.collection('pages').doc(preview.pageOid)
  batch.update(pagesRef, {
    public: true,
    invite: preview.invite
  })

  const previewsRef = DB.collection('previews').doc()
  batch.set(previewsRef, preview)

  return batch.commit()
}

export function setPageAndPreviewInviteState(pageOid, previewOid, isInvite) {
  log(
    `Setting page:[${pageOid}] and preview:[${previewOid}] invite state:[${isInvite}`
  )

  const batch = DB.batch()
  const pagesRef = DB.collection('pages').doc(pageOid)
  batch.update(pagesRef, {
    invite: isInvite
  })

  const previewsRef = DB.collection('previews').doc(previewOid)
  batch.update(previewsRef, {
    invite: isInvite
  })

  return batch.commit()
}

export function deletePage(pageOid) {
  log(`Deleting page:[${pageOid}]`)
  const pagesRef = DB.collection('pages').doc(pageOid)
  return pagesRef.delete()
}

export function getPagesRef(pageOid) {
  return DB.collection('pages').doc(pageOid)
}
