/**
 * Check-auth middleware called on every route.
 * See: https://nuxtjs.org/guide/routing#middleware
 *
 * @deprecated replaced by authenticated.js middleware because this was called for every route, including unauthenticated
 * routes like signin. Authenticated middleware is only called on the components that reference it, i.e. secure pages
 */
import firebaseApp from '~/firebaseApp.js'

export default function (context) {
  context.userAgent = context.isServer ? context.req.headers['user-agent'] : navigator.userAgent
  firebaseApp.auth().onAuthStateChanged(user => {
    console.log('[CHECK-AUTH.JS] Firebase onAuthStateChanged. isServer:' + context.isServer)
    if (context.isServer && context.req.session && context.req.session.user) {
      console.log('[CHECK-AUTH.JS] OnAuthStateChanged called from the server')
    } else if (user) {
      console.log('[CHECK-AUTH.JS] User set:' + JSON.stringify(user))
    }
  })
}
