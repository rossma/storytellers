
export default async function ({ store, redirect }) {
  console.log('[AUTHENTICATED MIDDLEWARE] - default')

  if (!store.getters['modules/user/isAuthenticated']) {
    console.log('[AUTHENTICATED MIDDLEWARE] - User is not authenticated redirecting to signin')
    return redirect('/auth/signin')
  } else if (process.client && !store.getters['modules/user/user']) {
    console.log('[AUTHENTICATED MIDDLEWARE] - User ID is set but not User')
    await store.dispatch('modules/user/saveUserByUid', store.getters['modules/user/uid'])
  }
}
