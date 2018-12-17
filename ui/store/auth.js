import { AUTH, onAuthStateChanged } from 'fire/app'
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
    console.log('[AUTH ACTIONS] - auth reset state')
    dispatch('user/resetState', {}, { root: true })
    commit('resetState')
  },

  async initUserOnAuthStateChange ({ dispatch, commit, state }) {
    console.log('[AUTH ACTIONS] - initUserOnAuthStateChange')

    let user = null
    return new Promise(async (resolve, reject) => {
      if (state.unsubscribeAuthObserver) {
        state.unsubscribeAuthObserver()
      }

      // const unsubscribe = AUTH.onAuthStateChanged(user => {
      const unsubscribe = await onAuthStateChanged(user => {
        console.log('[AUTH ACTION] firebase user has changed', user)
        if (user) {
          dispatch('user/saveUserByUid', user.uid, { root: true }).then(() => {
            console.log('[AUTH ACTION] - finished saving user to store')
            this.user = user
            // resolve(user)
          }).catch((error) => {
            console.log('Error saving the user by uid', error)
            // resolve(null)
          })
        }
      })
      if (unsubscribe) {
        console.log('[AUTH ACTION] committing unsubscriber for auth observer', unsubscribe)
        commit('setUnsubscribeAuthObserver', unsubscribe)
      }
      resolve(user)
    })
  },

  // fetchAuthUser ({ dispatch, commit }) {
  //   console.log('[AUTH ACTION] - fetchAuthUser')
  //
  //   const uid = AUTH.currentUser.uid
  //   return new Promise((resolve, reject) => {
  //     // check if user exists in the database
  //     findUserByOid(uid).then((userDoc) => {
  //       if (userDoc.exists) {
  //         console.log('[AUTH ACTION] - fetchAuthUser - user exists', userDoc)
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
  //         console.log('[AUTH ACTION] - fetchAuthUser - user does not exist')
  //         resolve(null)
  //       }
  //     })
  //   })
  // },

  saveUID ({ commit }, uid) {
    console.log('[AUTH ACTIONS] - saveUID')
    commit('saveUID', uid)
  },

  async login ({ dispatch, state }, uid) {
    console.log('[AUTH ACTIONS] - login', uid)
    try {
      const token = await AUTH.currentUser.getIdToken(true)

      const { status } = await this.$axios.$post('/login', { user: state.user, token: token })

      console.log('[AUTH ACTIONS] - in login, response:', status)

      await dispatch('saveUID', uid)
      // await dispatch('user/saveUserByUid', uid, { root: true })

      dispatch('initUserOnAuthStateChange')
    } catch (error) {
      console.log('[AUTH ACTIONS] - caught error', error)
      return Promise.reject(new Error('Error logging in user'))
    }
  },

  async logout ({ dispatch }) {
    console.log('[AUTH ACTIONS] - logout')
    try {
      await AUTH.signOut()

      await dispatch('resetState')

      const { status } = await this.$axios.post('/logout')
      console.log('[AUTH ACTIONS] - in logout, response:', status)
    } catch (error) {
      console.log('[AUTH ACTIONS] - caught error', error)
      return Promise.reject(new Error('Error logging out'))
    }
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
