export default function ({ store, redirect }) {
  console.log('[ANONYMOUS MIDDLEWARE] - default')

  if (store.getters['auth/isAuthenticated']) {
    return redirect('/')
  }
}
