/**
 * Check if user is authenticated. If not redirect to the login page
 *
 * Note on client side this only gets called if route changes, if you refresh same page this isn't called
 * https://github.com/nuxt/nuxt.js/issues/2492
 */
export default async function ({ store, redirect }) {
  console.log('[AUTHENTICATED MIDDLEWARE] - default')
  try {
    if (!store.getters['auth/isAuthenticated']) {
      console.log('[AUTHENTICATED MIDDLEWARE] - User is not authenticated redirecting to signin')
      return redirect('/auth/signin')
    }
  } catch (error) {
    console.log('[AUTHENTICATED MIDDLEWARE] - caught error', error)
    return redirect('/auth/signin')
  }
}
