// import firebaseApp, { DB } from 'fire/app'
// import firebase from 'firebase'
import { DB } from 'fire/app'
import debug from 'debug'
const log = debug('app:api/service/story')

function findStories(storiesRef) {
  return storiesRef.get().then(querySnapshot => {
    return querySnapshot.docs.map(m => {
      return {
        id: m.id,
        cover: m.data().cover,
        created: m.data().created,
        summary: m.data().summary,
        title: m.data().title,
        uid: m.data().uid
      }
    })
  })
}

export function findStoriesByUser(userOid) {
  log(`Finding stories by user:[${userOid}]`)
  return findStories(
    DB.collection('stories')
      .where('uid', '==', userOid)
      .orderBy('created', 'desc')
  )
}

export function findStoryByOid(storyOid) {
  log(`Finding story by oid:[${storyOid}]`)
  const storiesRef = DB.collection('stories').doc(storyOid)
  return storiesRef.get()
}

export function updateStory(storyOid, story) {
  log(`Updating story:[${storyOid} with:[${JSON.stringify(story)}]`)
  return DB.collection('stories')
    .doc(storyOid)
    .set(story, { merge: true })
}

export function deleteCover(storyOid) {
  log(`Deleting cover to story:[${storyOid}]`)
  const firebase = require('firebase/app')
  return DB.collection('stories')
    .doc(storyOid)
    .update({
      cover: firebase.firestore.FieldValue.delete()
    })
}

export function addStory(story, chapter, page) {
  log(`Adding story:`, story, chapter, page)

  const batch = DB.batch()
  const storiesRef = DB.collection('stories').doc()
  batch.set(storiesRef, story)

  const chaptersRef = DB.collection('chapters').doc()
  chapter.storyOid = storiesRef.id
  batch.set(chaptersRef, chapter)

  const pagesRef = DB.collection('pages').doc()
  page.storyOid = storiesRef.id
  page.chapterOid = chaptersRef.id
  batch.set(pagesRef, page)

  return batch.commit().then(() => {
    return Promise.resolve({
      storyOid: storiesRef.id,
      chapterOid: chaptersRef.id,
      pageOid: pagesRef.id
    })
  })
}

export function deleteStory(storyOid) {
  log(`Deleting story:[${storyOid}`)
  const storyRef = DB.collection('stories').doc(storyOid)
  return storyRef.delete()
}
