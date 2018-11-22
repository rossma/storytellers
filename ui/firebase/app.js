import firebase from 'firebase'
import 'firebase/firestore'
// require('firebase/firestore')

const config = {
  apiKey: process.env.FIREBASE_CLIENT_API_KEY,
  authDomain: `${process.env.FIREBASE_CLIENT_PROJECT_ID}.firebaseapp.com`,
  // databaseURL: process.env.FIREBASE_CLIENT_DATABASE_URL,
  messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
  projectId: process.env.FIREBASE_CLIENT_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_CLIENT_PROJECT_ID}.appspot.com`
}

const firebaseApp = !firebase.apps.length ? firebase.initializeApp(config) : firebase.app()

firebaseApp.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log('[FIREBASE] - User is logged in', user)
  } else {
    console.log('[FIREBASE] - User is not logged in')
  }
})

export default firebaseApp

export const DB = firebaseApp.firestore()
const settings = {/* your settings... */ timestampsInSnapshots: true}
DB.settings(settings)

