/**
 * Check if user is authenticated. If not redirect to the login page
 *
 * Note on client side this only gets called if route changes, if you refresh same page this isn't called
 * https://github.com/nuxt/nuxt.js/issues/2492
 */
import debug from 'debug'
const log = debug('app:middleware/authenticated')

export default function({ store, redirect }) {
  try {
    if (!store.getters['auth/isAuthenticated']) {
      log('User is not authenticated redirecting to signin')
      return redirect('/auth/signin')
    }
  } catch (error) {
    log('caught error', error)
    return redirect('/auth/signin')
  }
}
