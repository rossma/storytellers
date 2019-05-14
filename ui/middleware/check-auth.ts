import { AUTH } from 'fire/app'
import debug from 'debug'
const log = debug('app:middleware/check-auth')

function getUserFromSession(req) {
  log('[CHECK-AUTH] - checking if user is stored in session')
  return req.session ? req.session.user : null
}
//
// function getUserFromCookie (req) {
//   log('[CHECK-AUTH] - checking if user is stored in cookie')
//   if (!req.headers.cookie) return
//
//   const accessTokenCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('access_token='))
//   if (!accessTokenCookie) return
//
//   const accessToken = accessTokenCookie.split('=')[1]
//   const decodedToken = jwtDecode(accessToken)
//   if (!decodedToken) return
//
//   return { uid: decodedToken.sub }
// }

/* get the encoded token stored in cookie */
function getEncodedIdToken(req) {
  log('[CHECK-AUTH] - getting decoded ID token')
  if (!req.headers.cookie) return

  const accessTokenCookie = req.headers.cookie
    .split(';')
    .find(c => c.trim().startsWith('access_token='))
  if (!accessTokenCookie) return

  const accessToken = accessTokenCookie.split('=')[1]
  return accessToken
}

export default function({ store, req }) {
  if (process.server && !store.getters['auth/isAuthenticated']) {
    // log('Request Headers:', req.headers)

    /* On login we save the user in the session and the token in the cookie. Most of the time we can just get the user
      from the session but there are times when we need to fetch the token from the cookie and user firebase admin to
      verify it. Firebase by default uses persisted state which keeps a user signed in even if they close their browser
      and reopen it.
     */
    const user = getUserFromSession(req)
    log('user from session:', user)
    // if (!user || !user.uid) {
    //   log('User not found in session, looking up in cookie')
    //   user = getUserFromCookie(req)
    // }

    // if (user && user.uid) {
    if (!user || !user.uid) {
      // log('User found, going to save the user UID in the store')
      log('User not found in session, getting token from request')
      const encodedToken = getEncodedIdToken(req)
      if (encodedToken) {
        log('User token found, going to save the user in the store')
        /* previously was doing this using jwt-decode module but now calling firebase direct from server to valid token */
        // const admin = require('fire/app')

        AUTH.verifyIdToken(encodedToken)
          .then(user => {
            log('Token verified going to save user to store', user.uid)
            store.dispatch('auth/saveUID', user.uid)
          })
          .catch(error => {
            log('Error verifying user in firebase', error)
          })
      } else {
        log('User token not found')
      }
    }
  }
}
