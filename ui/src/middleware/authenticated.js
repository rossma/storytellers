/**
 * Verify user authentication status. If the user us not authenticated then redirect the user to the signin component.
 *
 * Function called for every secure page from client or server. The page needs to include this middleware component in
 * its configuration in order for this function be called.
 */
import firebaseApp from '~/firebaseApp'

export default function ({ req, error, store, route, redirect }) {
  console.log('[AUTHENTICATED MIDDLEWARE] Route:', route)
  if (process.server) {
    console.log(`[AUTHENTICATED MIDDLEWARE] Server: ${process.server} -req:`, req.session)

    if (!req.session || !req.session.user) {
      console.log('[AUTHENTICATED MIDDLEWARE] process.server - user not set')
      redirect('/auth/signin')
    }
  } else if (process.client) {
    console.log('[AUTHENTICATED MIDDLEWARE] process.client')
    if (!firebaseApp.auth().currentUser) {
      console.log('[AUTHENTICATED MIDDLEWARE] firebaseCurrent user is not set')
      redirect('/auth/signin')
    }
  }
}
