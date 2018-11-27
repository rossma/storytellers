import firebaseApp from '~/firebase/app'

const DB = firebaseApp.firestore()

function findChapters (chaptersRef) {
  return chaptersRef.get().then((querySnapshot) => {
    return querySnapshot.docs.map((m) => {
      return {
        id: m.id,
        chapter: m.data().chapter,
        name: m.data().name,
        storyOid: m.data().storyOid,
        uid: m.data().uid
      }
    })
  })
}

export function findChaptersByUser (userOid) {
  console.log(`[Chapter Service] - Finding chapters by user:[${userOid}]`)
  return findChapters(DB.collection('chapters').where('uid', '==', userOid))
}

export function findChaptersByStory (storyOid) {
  console.log(`[Chapter Service] - Finding chapters by story:[${storyOid}]`)
  return findChapters(DB.collection('chapters').where('storyOid', '==', storyOid))
}

export function findChapterByOid (chapterOid) {
  console.log(`[Chapter Service] - Finding chapter by oid:[${chapterOid}]`)
  let chaptersRef = DB.collection('chapters').doc(chapterOid)
  return chaptersRef.get()
}

export function updateChapterName (chapterOid, chapterName) {
  console.log(`[Chapter Service] - Updating chapter:[${chapterOid}] with name:[${chapterName}]`)
  let chapterRef = DB.collection('chapters').doc(chapterOid)
  chapterRef.update({
    name: chapterName
  })
}

export function addChapter (chapter) {
  console.log(`[Chapter Service] - Adding chapter:`, chapter)
  return DB.collection('chapters').add(chapter)
}

export function deleteChapter (chapterOid) {
  console.log(`[Chapter Service] - Deleting chapter:[${chapterOid}`)
  let chapterRef = DB.collection('chapters').doc(chapterOid)
  return chapterRef.delete()
}
