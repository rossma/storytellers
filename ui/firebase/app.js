import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore'
import config from '~/firebase/config'
import debug from 'debug'
const log = debug('app:firebase/app')

log(
  'firebase process.env.FIREBASE_CLIENT_PROJECT_ID:',
  process.env.FIREBASE_CLIENT_PROJECT_ID
)

const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp(config)
  : firebase.app()

export default firebaseApp

export const DB = firebaseApp.firestore()
const settings = { /* your settings... */ timestampsInSnapshots: true }
DB.settings(settings)

export const STORAGE = firebaseApp.storage()

export const FBASE = firebaseApp

export const STORAGE_REF = firebaseApp.storage().ref()

export const AUTH = firebaseApp.auth()

export async function onAuthStateChanged(nextOrObserver) {
  log('[FIREBASE APP] - checking if onAuthStateChanged')
  return firebaseApp.auth().onAuthStateChanged(nextOrObserver)
}
