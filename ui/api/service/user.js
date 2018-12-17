// import firebaseApp from 'fire/app'
import { DB } from 'fire/app'

// const DB = firebaseApp.firestore()

export function findUserByOid (userOid) {
  console.log(`[User Service] - Finding user by oid:[${userOid}]`)
  let usersRef = DB.collection('users').doc(userOid)
  return usersRef.get()
}

export function updateUserDoc (userOid, user) {
  console.log(`[User Service] - Updating user:[${userOid}] with:[${JSON.stringify(user)}]`)
  return DB.collection('users').doc(userOid).set(user, { merge: true })
}

export function addUser (user) {
  console.log(`[User Service] - Adding user:[${JSON.stringify(user)}]`)
  return DB.collection('users').doc(user.uid).set(user)
}
