
export const actions = {

  async nuxtServerInit ({ dispatch }, { req }) {
    console.log('[STORE ACTION]- in nuxServerInit:', req.session)

    // if (req.session && req.session.userId) {
    //   console.log(`[STORE ACTION] found uid in session:${JSON.stringify(req.session.userId)}`)
    //   await dispatch('saveUID', req.session.userId)
    // }
    if (req.session && req.session.user && req.session.user.uid) {
      console.log(`[STORE ACTION] found user in session:${JSON.stringify(req.session.user)}`)
      await dispatch('saveUser', req.session.user)
    }
  }

}
