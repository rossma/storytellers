// import admin from 'firebase-admin'
// import config from '~/firebase/config'
//
// const firebaseAdmin = admin.initializeApp(config)
//
// export default firebaseAdmin

import config from '~/firebase/config'
console.log('IN ADMIN')

const admin = require('firebase-admin') // only require on server side
// const config = require('~/firebase/config')

// const firebaseApp = !admin.apps.length ? admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: config.databaseURL,
//   // storageBucket: config.storageBucket
// }) : admin.app()

let firebaseApp = null
let db = null

if (!admin.apps.length) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG),
    databaseURL: config.databaseURL,
    // storageBucket: config.storageBucket
  })

  const settings = { /* your settings... */ timestampsInSnapshots: true }
  db = firebaseApp.firestore()
  db.settings(settings)
} else {
  firebaseApp = admin.app()
}

export default firebaseApp

export const DB = db

export const STORAGE = admin.storage()

export const TMP = 'this is the admin'

export const FBASE = firebaseApp

export const STORAGE_REF = admin.storage().bucket(config.storageBucket)

export const AUTH = admin.auth()

export async function onAuthStateChanged (nextOrObserver) {
  console.log('[FIREBASE ADMIN] - onAuthStateChanged not available on server')
  Promise.resolve(null)
}
