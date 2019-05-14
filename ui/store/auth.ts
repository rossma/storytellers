import { AUTH, onAuthStateChanged } from 'fire/app'
import { Auth } from '~/types'
import { Unsubscribe } from 'firebase'
import debug from 'debug'
const log = debug('app:store/auth')

const defaultState = (): Auth => ({
  uid: undefined,
  unsubscribeAuthObserver: null
})

export const state = defaultState

export const getters = {
  isAuthenticated(state, getters, rootState): boolean {
    return !!state.uid || !!rootState.user.user.uid
  },

  uid(state): string {
    return state.uid
  }
}

export const actions = {
  resetState({ dispatch, commit }): void {
    log('auth reset state')
    dispatch('user/resetState', {}, { root: true })
    commit('resetState')
  },

  initUserOnAuthStateChange({ dispatch, commit, state }): Promise<any> {
    log('initUserOnAuthStateChange')
    let user2: any = null
    return new Promise(async resolve => {
      if (state.unsubscribeAuthObserver) {
        state.unsubscribeAuthObserver()
      }

      // const unsubscribe = AUTH.onAuthStateChanged(user => {
      const unsubscribe: Unsubscribe = await onAuthStateChanged(user => {
        log('[AUTH ACTION] firebase user has changed', user)
        if (user) {
          dispatch('user/saveUserByUid', user.uid, { root: true })
            .then(() => {
              log('[AUTH ACTION] - finished saving user to store')
              user2 = user
              // resolve(user)
            })
            .catch(error => {
              log('Error saving the user by uid', error)
              // resolve(null)
            })
        }
      })
      if (unsubscribe) {
        log(
          '[AUTH ACTION] committing unsubscriber for auth observer',
          unsubscribe
        )
        commit('setUnsubscribeAuthObserver', unsubscribe)
      }
      resolve(user2)
    })
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
      const auth = await AUTH
      if (auth && auth.currentUser) {
        const token = auth.currentUser.getIdToken(true)

        const { status } = await (this as any).$axios.$post('/login', {
          user: state.user,
          token: token
        })

        log('in login, response:', status)

        await dispatch('saveUID', uid)
        // await dispatch('user/saveUserByUid', uid, { root: true })

        dispatch('initUserOnAuthStateChange')
      } else {
        // todo
      }
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

      const { status } = await (this as any).$axios.post('/logout')
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
