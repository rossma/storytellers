import firebaseApp from '~/firebase/app'
import { findUserByOid } from '~/api/service/user'

const defaultState = () => ({
  uid: null,
  unsubscribeAuthObserver: null
})

export const state = defaultState

export const getters = {

  isAuthenticated (state, getters, rootState) {
    return !!state.uid || !!rootState.user.user.uid
  },

  uid (state) {
    return state.uid
  }

}

export const actions = {

  resetState ({ dispatch, commit }) {
    console.log('[AUTH ACTIONS] - user reset state')
    dispatch('user/resetState', {}, { root: true })
    commit('resetState')
  },

  initAuthentication ({ dispatch, commit, state }) {
    console.log('[AUTH ACTIONS] - initAuthentication ')

    return new Promise((resolve, reject) => {
      if (state.unsubscribeAuthObserver) {
        state.unsubscribeAuthObserver()
      }

      const unsubscribe = firebaseApp.auth().onAuthStateChanged(user => {
        console.log('[AUTH ACTION] firebase user has changed', user)
        if (user) {
          dispatch('fetchAuthUser').then(dbUser => resolve(dbUser))
        } else {
          resolve(null)
        }
      })
      // console.log('[AUTH ACTION] committing unsubscriber for auth observer')
      commit('setUnsubscribeAuthObserver', unsubscribe)
    })
  },

  fetchAuthUser ({ dispatch, commit }) {
    const uid = firebaseApp.auth().currentUser.uid
    return new Promise((resolve, reject) => {
      // check if user exists in the database
      findUserByOid(uid).then((userDoc) => {
        if (userDoc.exists) {
          resolve(userDoc)
          // return dispatch('user/fetchUser', { id: uid }, { root: true })
          //   .then(user => {
          //     commit('saveUID', uid)
          //     resolve(user)
          //   })
        } else {
          resolve(null)
        }
      })
    })
  },

  saveUID ({ commit }, uid) {
    console.log('[AUTH ACTIONS] - saveUID')
    commit('saveUID', uid)
  },

  async login ({ dispatch, state }, uid) {
    console.log('[AUTH ACTIONS] - login', uid)
    const token = await firebaseApp.auth().currentUser.getIdToken(true)

    const { status } = await this.$axios.$post('/login', { user: state.user, token: token })

    console.log('[AUTH ACTIONS] - in login, response:', status)

    // await dispatch('saveUserByUid', uid)
    await dispatch('user/saveUserByUid', uid, { root: true })
  },

  async logout ({ dispatch }) {
    console.log('[AUTH ACTIONS] - logout')
    await firebaseApp.auth().signOut()

    await dispatch('resetState')

    const { status } = await this.$axios.post('/logout')
    console.log('[AUTH ACTIONS] - in logout, response:', status)
  }

}

export const mutations = {

  resetState (state) {
    console.log('[AUTH MUTATIONS] - resetState')
    Object.assign(state, defaultState())
  },

  saveUID (state, uid) {
    console.log('[AUTH MUTATIONS] - saveUID:', uid)
    state.uid = uid
  },

  setUnsubscribeAuthObserver (state, unsubscribe) {
    console.log('[AUTH MUTATIONS] - setUnsubscribeAuthObserver')
    state.unsubscribeAuthObserver = unsubscribe

  }
}
