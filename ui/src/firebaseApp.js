import firebase from 'firebase'

import env from 'config'

const config = {
  apiKey: env.FIREBASE.API_KEY,
  authDomain: `${env.FIREBASE.PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${env.FIREBASE.DATABASE_NAME}.firebaseio.com`,
  projectId: env.FIREBASE.PROJECT_ID,
  storageBucket: `${env.FIREBASE.BUCKET}.appspot.com`,
  messagingSenderId: env.FIREBASE.SENDER_ID
}

export default !firebase.apps.length ? firebase.initializeApp(config) : firebase.app()
