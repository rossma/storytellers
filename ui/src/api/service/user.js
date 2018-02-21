import firebaseApp from '~/firebase/app'

const DB = firebaseApp.firestore()

export function findUserByOid (userOid) {
  console.log(`[User Service] - Finding user by oid:[${userOid}]`)
  let usersRef = DB.collection('users').doc(userOid)
  return usersRef.get()
}

export function updateUserDoc (userOid, user) {
  console.log(`[user Service] - Updating user:[${userOid} with:[${user}]`)
  return DB.collection('users').doc(userOid).set(user, { merge: true })
}

export function addUser (user) {
  console.log(`[User Service] - Adding user:[${user}]`)
  return DB.collection('users').doc(user.uid).set(user.data)
}
