export default function ({ store, redirect }) {
  console.log('[ANONYMOUS] - default')

  if (store.getters.isAuthenticated) {
  	console.log('[ANONYMOUS] - blah')
    return redirect('/')
  }
}
