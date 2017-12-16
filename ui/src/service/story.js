import firebaseApp from '~/firebaseApp'

const DB = firebaseApp.firestore()

function findStories (storiesRef) {
  return storiesRef.get().then((querySnapshot) => {
    return querySnapshot.docs.map((m) => {
      let story = {
        id: m.id,
        data: m.data()
      }
      return story
    })
  })
}

export function findStoriesByUser (userOid) {
  console.log(`[Story Service] - Finding stories by user:[${userOid}]`)
  return findStories(DB.collection('stories').where('uid', '==', userOid))
}

export function findStoryByOid (storyOid) {
  console.log(`[Story Service] - Finding story by oid:[${storyOid}]`)
  let storiesRef = DB.collection('stories').doc(storyOid)
  return storiesRef.get()
}

export function addStory (story) {
  console.log(`[Story Service] - Adding story:[${story}]`)
  return DB.collection('stories').add(story)
}