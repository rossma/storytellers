import config from '~/firebase/config'
import debug from 'debug'
const log = debug('app:firebase/admin')

const admin = require('firebase-admin') // only require on server side

let firebaseApp = null
let db = null

if (!admin.apps.length) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(
      process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG
    ),
    databaseURL: config.databaseURL
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

export const FBASE = firebaseApp

export const STORAGE_REF = admin.storage().bucket(config.storageBucket)

export const AUTH = admin.auth()

export async function onAuthStateChanged(nextOrObserver) {
  log('[FIREBASE ADMIN] - onAuthStateChanged not available on server')
  Promise.resolve(null)
}
