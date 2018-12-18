const config = {
  apiKey: process.env.FIREBASE_CLIENT_API_KEY,
  authDomain: `${process.env.FIREBASE_CLIENT_PROJECT_ID}.firebaseapp.com`,
  // databaseURL: process.env.FIREBASE_CLIENT_DATABASE_URL,
  databaseURL: `https://${process.env.FIREBASE_DATABASE_NAME}.firebaseio.com`,
  messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
  projectId: process.env.FIREBASE_CLIENT_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_CLIENT_PROJECT_ID}.appspot.com`
}

export default config
