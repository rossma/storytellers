export default function ({ store, redirect }) {
  console.log('[ANONYMOUS] - default')

  if (store.getters.isAuthenticated) {
    return redirect('/')
  }
}
