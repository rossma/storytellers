/* Note on client side this only gets called if route changes, if you refresh same page this isn't called
 * https://github.com/nuxt/nuxt.js/issues/2492
 * maybe there is a way to get it called on refresh...by giving a unique route id to every route?
 * */
export default async function ({ store, redirect }) {
  console.log('[AUTHENTICATED MIDDLEWARE] - default')

  if (!store.getters['auth/isAuthenticated']) {
    store.dispatch('auth/initAuthentication').then(user => {
      console.log('[AUTHENTICATED MIDDLEWARE] user returned from initAuthentication:', user)
      if (user) {
        console.log('[AUTHENTICATED MIDDLEWARE] - User is set', user)
        // await store.dispatch('user/saveUserByUid', store.getters['user/uid'])
      } else {
        console.log('[AUTHENTICATED MIDDLEWARE] - User is not authenticated redirecting to signin')
        return redirect('/auth/signin')
      }
    })
  } else if (process.client && !store.getters['user/user'].uid) {
    console.log('[AUTHENTICATED MIDDLEWARE] - User ID is set but not User')
    await store.dispatch('user/saveUserByUid', store.getters['auth/uid'])
  }

  // initAuthentication can actually returning the user so no need to call it?
  // if (!store.getters['auth/isAuthenticated']) {
  //   console.log('[AUTHENTICATED MIDDLEWARE] - User is not authenticated redirecting to signin')
  //   return redirect('/auth/signin')
  // } else if (process.client && !store.getters['user/user'].uid) {
  //   console.log('[AUTHENTICATED MIDDLEWARE] - User ID is set but not User')
  //   await store.dispatch('user/saveUserByUid', store.getters['user/uid'])
  // }
}
