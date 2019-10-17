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
        summary: m.data().summary,
        comments: m.data().comments,
        likes: m.data().likes,
        wallpaperUrl: m.data().wallpaperUrl
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
  return findPages(
    DB.collection('pages')
      .where('storyOid', '==', storyOid)
      .orderBy('chapterOid')
  )
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
  return DB.collection('pages')
    .add(page)
    .then(pagesRef => {
      page.id = pagesRef.id
      return Promise.resolve(page)
    })
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

export function deletePage(pageOid) {
  log(`Deleting page:[${pageOid}]`)
  const pagesRef = DB.collection('pages').doc(pageOid)
  return pagesRef.delete()
}

export function getPagesRef(pageOid) {
  return DB.collection('pages').doc(pageOid)
}

export const DEFAULT_WALLPAPERS = [
  'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/images%2Fwallpaper%2Fwall1.jpg?alt=media&token=58416e24-16c8-4f82-bb00-da9db6eb350e',
  'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/images%2Fwallpaper%2Fwall2.jpg?alt=media&token=2befc038-2dc5-4d07-bd60-c42630a32591',
  'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/images%2Fwallpaper%2Fwall3.jpg?alt=media&token=b4fa4e6b-a602-40ab-87d2-cd7a0c981850',
  'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/images%2Fwallpaper%2Fwall4.jpg?alt=media&token=3e7fbe9c-a3fd-4fc8-948b-7b35e17aee11',
  'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/images%2Fwallpaper%2Fwall5.jpg?alt=media&token=477e54d0-5a60-48a8-afe4-1e9009ca336b',
  'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/images%2Fwallpaper%2Fwall6.jpg?alt=media&token=bd69fcc6-d5a0-44c4-a420-1350eb503450',
  'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/images%2Fwallpaper%2Fwall7.jpg?alt=media&token=3b110b67-1d23-4d5a-8494-461e93ee23f3',
  'https://firebasestorage.googleapis.com/v0/b/storytellers2-13997.appspot.com/o/images%2Fwallpaper%2Fwall8.jpg?alt=media&token=7d730fd4-5eb0-41e1-abab-ea8863cc5462'
]

export function getRandomPreviewWallpaper() {
  return DEFAULT_WALLPAPERS[randomWallpaperIndex()]
}


function randomWallpaperIndex() {
  return randomIntFromInterval(0, DEFAULT_WALLPAPERS.length - 1)
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
