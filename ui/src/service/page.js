import firebaseApp from '~/firebaseApp'

const DB = firebaseApp.firestore()

function findPages (pagesRef) {
  return pagesRef.get().then((querySnapshot) => {
    return querySnapshot.docs.map((m) => {
      let page = {
        id: m.id,
        data: m.data()
      }
      return page
    })
  })
}

export function findPagesByUser (userOid) {
  console.log(`[Page Service] - Finding pages by user:[${userOid}]`)
  return findPages(DB.collection('pages').where('uid', '==', userOid))
}

export function findPagesByStory (storyOid) {
  console.log(`[Page Service] - Finding pages by story:[${storyOid}]`)
  return findPages(DB.collection('pages').where('storyOid', '==', storyOid))
}

export function findPageByOid (pageOid) {
  console.log(`[Page Service] - Finding page by oid:[${pageOid}]`)
  let pagesRef = DB.collection('pages').doc(pageOid)
  return pagesRef.get()
}

export function addPage (page) {
  console.log(`[Page Service] - Adding page:[${page}]`)
  return DB.collection('pages').add(page)
}

export function updatePage (pageOid, page) {
  console.log(`[Page Service] - Updating page:[${pageOid} with:[${page}]`)
  return DB.collection('pages').doc(pageOid).set(page)
}
