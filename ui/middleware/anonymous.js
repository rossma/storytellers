export default function ({ store, redirect }) {
  console.log('[ANONYMOUS MIDDLEWARE] - default')

  if (store.getters['modules/user/isAuthenticated']) {
    return redirect('/')
  }
}
