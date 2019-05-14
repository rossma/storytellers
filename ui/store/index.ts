import debug from 'debug'
const log = debug('app:store/index')

export const actions = {
  async nuxtServerInit({ dispatch }, { req }) {
    console.log('in nuxServerInit:')
    log('in nuxServerInit:', req.session)
    if (req.session && req.session.user && req.session.user.uid) {
      log(
        `[STORE ACTION] found user in session:${JSON.stringify(
          req.session.user
        )}`
      )
      await dispatch('saveUser', req.session.user)
    }
  }
}
