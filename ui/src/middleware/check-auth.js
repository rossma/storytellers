/**
 * Check-auth middleware called on every route.
 * See: https://nuxtjs.org/guide/routing#middleware
 *
 * @deprecated replaced by authenticated.js middleware because this was called for every route, including unauthenticated
 * routes like signin. Authenticated middleware is only called on the components that reference it, i.e. secure pages
 */
import firebaseApp from '~/firebaseApp.js'

/* @deprecated */
export default function (context) {
  context.userAgent = process.server ? context.req.headers['user-agent'] : navigator.userAgent
  firebaseApp.auth().onAuthStateChanged(user => {
    console.log('[CHECK-AUTH.JS] Firebase onAuthStateChanged. isServer:' + process.server)
    if (process.server && context.req.session && context.req.session.user) {
      console.log('[CHECK-AUTH.JS] OnAuthStateChanged called from the server')
    } else if (user) {
      console.log('[CHECK-AUTH.JS] User set:' + JSON.stringify(user))
    }
  })
}
