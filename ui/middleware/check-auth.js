import jwtDecode from 'jwt-decode'

export default function ({ store, req }) {
  console.log('[CHECK-AUTH MIDDLEWARE] - default function')

  if (process.server && !store.getters['auth/isAuthenticated']) {
    console.log('[CHECK-AUTH MIDDLEWARE] - is server')
    // console.log('Request Headers:', req.headers)

    /* On login we save the user in the session and the token in the cookie. Most of the time we can just get the user
      from the session but there are times when we need to fetch the token from the cookie and decode it to find the uid.
      Firebase by default uses persisted state which keeps a user signed in even if they close their browser and reopen it.
     */
    let user = getUserFromSession(req)
    console.log('[CHECK-AUTH MIDDLEWARE] - user from session:', user)
    if (!user || !user.uid) {
      console.log('[CHECK-AUTH MIDDLEWARE] - User not found in session, looking up in cookie')
      user = getUserFromCookie(req)
    }

    if (user && user.uid) {
      console.log('[CHECK-AUTH MIDDLEWARE] - User found, going to initialise the user object by uid in the store')
      /* not calling saveUserByUid as this requires the user to be signed in, on the server here not signing user in
        instead using authenticated middleware to saveUserByUid  on the client when uid is not null but user is
       */
      store.dispatch('auth/saveUID', user.uid)
    }
  }
}

function getUserFromSession (req) {
  console.log('[CHECK-AUTH] - checking if user is stored in session')
  return req.session ? req.session.user : null
}

function getUserFromCookie (req) {
  console.log('[CHECK-AUTH] - checking if user is stored in cookie')
  if (!req.headers.cookie) return

  const accessTokenCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('access_token='))
  if (!accessTokenCookie) return

  const accessToken = accessTokenCookie.split('=')[1]
  const decodedToken = jwtDecode(accessToken)
  if (!decodedToken) return

  return { uid: decodedToken.sub }
}
