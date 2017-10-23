/**
 * Verify user authentication status. If the user us not authenticated then redirect the user to the signin component.
 *
 * Function called for every secure page from client or server. The page needs to include this middleware component in
 * its configuration in order for this function be called.
 */
import firebaseApp from '~/firebaseApp'

export default function ({ req, error, isServer, isClient, store, route, redirect }) {
  console.log('[AUTHENTICATED MIDDLEWARE] Route:' + JSON.stringify(route))
  if (isServer) {
    console.log('[AUTHENTICATED MIDDLEWARE] Server:' + isServer + '-req:' + req.session)

    if (isServer && (!req.session || !req.session.user)) {
      console.log('[AUTHENTICATED MIDDLEWARE] isServer - user not set')
      redirect('/auth/signin')
    }
  } else if (isClient) {
    console.log('[AUTHENTICATED MIDDLEWARE] isClient')
    if (!firebaseApp.auth().currentUser) {
      console.log('[AUTHENTICATED MIDDLEWARE] firebaseCurrent user is not set')
      redirect('/auth/signin')
    }
  }
}
