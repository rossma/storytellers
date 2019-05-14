// import firebaseApp from 'fire/app'
import { DB } from 'fire/app'
import debug from 'debug'
const log = debug('app:api/service/user')

export function findUserByOid(userOid) {
  log(`Finding user by oid:[${userOid}]`)
  const usersRef = DB.collection('users').doc(userOid)
  return usersRef.get()
}

export function updateUserDoc(userOid, user) {
  log(`Updating user:[${userOid}] with:[${JSON.stringify(user)}]`)
  return DB.collection('users')
    .doc(userOid)
    .set(user, { merge: true })
}

export function addUser(user) {
  log(`Adding user:[${JSON.stringify(user)}]`)
  return DB.collection('users')
    .doc(user.uid)
    .set(user)
}
