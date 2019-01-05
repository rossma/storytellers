import firebaseApp from 'fire/app'
import debug from 'debug'
const log = debug('app:api/service/chapter')

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
  log(`Finding chapters by user:[${userOid}]`)
  return findChapters(DB.collection('chapters').where('uid', '==', userOid))
}

export function findChaptersByStory (storyOid) {
  log(`Finding chapters by story:[${storyOid}]`)
  return findChapters(DB.collection('chapters').where('storyOid', '==', storyOid))
}

export function findChapterByOid (chapterOid) {
  log(`Finding chapter by oid:[${chapterOid}]`)
  let chaptersRef = DB.collection('chapters').doc(chapterOid)
  return chaptersRef.get()
}

export function updateChapterName (chapterOid, chapterName) {
  log(`Updating chapter:[${chapterOid}] with name:[${chapterName}]`)
  let chapterRef = DB.collection('chapters').doc(chapterOid)
  chapterRef.update({
    name: chapterName
  })
}

export function addChapter (chapter) {
  log(`Adding chapter:`, chapter)
  return DB.collection('chapters').add(chapter)
}

export function deleteChapter (chapterOid) {
  log(`Deleting chapter:[${chapterOid}`)
  let chapterRef = DB.collection('chapters').doc(chapterOid)
  return chapterRef.delete()
}
