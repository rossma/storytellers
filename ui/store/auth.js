import { AUTH, onAuthStateChanged } from 'fire/app'
import debug from 'debug'
const log = debug('app:store/auth')

const defaultState = () => ({
  uid: null,
  unsubscribeAuthObserver: null
})

export const state = defaultState

export const getters = {
  isAuthenticated(state, getters, rootState) {
    return !!state.uid || !!rootState.user.user.uid
  },

  uid(state) {
    return state.uid
  }
}

export const actions = {
  resetState({ dispatch, commit }) {
    log('auth reset state')
    dispatch('user/resetState', {}, { root: true })
    commit('resetState')
  },

  async initUserOnAuthStateChange({ dispatch, commit, state }) {
    log('initUserOnAuthStateChange')

    if (state.unsubscribeAuthObserver) {
      state.unsubscribeAuthObserver()
    }

    const unsubscribe = await onAuthStateChanged(async user => {
      log('[AUTH ACTION] firebase user has changed', user)
      if (user) {
        await dispatch('user/saveUserByUid', user.uid, { root: true })
      }
    })
    if (unsubscribe) {
      log(
        '[AUTH ACTION] committing unsubscriber for auth observer',
        unsubscribe
      )
      commit('setUnsubscribeAuthObserver', unsubscribe)
    }
  },

  // fetchAuthUser ({ dispatch, commit }) {
  //   log('[AUTH ACTION] - fetchAuthUser')
  //
  //   const uid = AUTH.currentUser.uid
  //   return new Promise((resolve, reject) => {
  //     // check if user exists in the database
  //     findUserByOid(uid).then((userDoc) => {
  //       if (userDoc.exists) {
  //         log('[AUTH ACTION] - fetchAuthUser - user exists', userDoc)
  //         // return dispatch('user/saveUser', userDoc, { root: true }).then(user => {
  //         //   resolve(user)
  //         // })
  //         // resolve(userDoc)
  //         // return dispatch('user/fetchUser', { id: uid }, { root: true })
  //         //   .then(user => {
  //         //     commit('saveUID', uid)
  //         //     resolve(user)
  //         //   })
  //       } else {
  //         log('[AUTH ACTION] - fetchAuthUser - user does not exist')
  //         resolve(null)
  //       }
  //     })
  //   })
  // },

  saveUID({ commit }, uid) {
    log('saveUID')
    commit('saveUID', uid)
  },

  async login({ dispatch, state }, uid) {
    log('login', uid)
    try {
      const token = await AUTH.currentUser.getIdToken(true)
      log('token', token)

      const { status } = await this.$axios.$post('/login', {
        user: state.user,
        token: token
      })

      log('in login, response:', status)

      await dispatch('saveUID', uid)
      // await dispatch('user/saveUserByUid', uid, { root: true })

      dispatch('initUserOnAuthStateChange')
    } catch (error) {
      log('caught error', error)
      return Promise.reject(new Error('Error logging in user'))
    }
  },

  async logout({ dispatch }) {
    log('logout')
    try {
      await AUTH.signOut()

      await dispatch('resetState')

      const { status } = await this.$axios.post('/logout')
      log('in logout, response:', status)
    } catch (error) {
      log('caught error', error)
      return Promise.reject(new Error('Error logging out'))
    }
  }
}

export const mutations = {
  resetState(state) {
    log('[AUTH MUTATIONS] - resetState')
    Object.assign(state, defaultState())
  },

  saveUID(state, uid) {
    log('[AUTH MUTATIONS] - saveUID:', uid)
    state.uid = uid
  },

  setUnsubscribeAuthObserver(state, unsubscribe) {
    log('[AUTH MUTATIONS] - setUnsubscribeAuthObserver')
    state.unsubscribeAuthObserver = unsubscribe
  }
}
