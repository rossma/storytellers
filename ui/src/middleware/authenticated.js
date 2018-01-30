
export default function ({ store, redirect }) {
  console.log('[AUTHENTICATED] - default')

  if (!store.getters.isAuthenticated) {
    console.log('User is not authenticated redirecting to signin')
    return redirect('/auth/signin')
  }
}
