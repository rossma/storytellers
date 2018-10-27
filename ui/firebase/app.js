import firebase from 'firebase'

require('firebase/firestore')

const config = {
  apiKey: process.env.FIREBASE_CLIENT_API_KEY,
  authDomain: `${process.env.FIREBASE_CLIENT_PROJECT_ID}.firebaseapp.com`,
  // databaseURL: process.env.FIREBASE_CLIENT_DATABASE_URL,
  messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
  projectId: process.env.FIREBASE_CLIENT_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_CLIENT_PROJECT_ID}.appspot.com`
}

export default !firebase.apps.length ? firebase.initializeApp(config) : firebase.app()
