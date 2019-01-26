import { findUserByOid, updateUserDoc } from '~/api/service/user'
import debug from 'debug'
const log = debug('app:store/user')

const defaultState = () => ({
  user: {}
})

export const state = defaultState

export const getters = {
  user(state) {
    return state.user
  }
}

export const actions = {
  resetState({ commit }) {
    log('[USER ACTIONS] - user reset state')
    commit('resetState')
  },

  saveUser({ commit }, userPayload) {
    log('[USER ACTIONS] - saveUser')
    commit('saveUser', userPayload)
  },

  async updateUser({ dispatch }, { user, userPart }) {
    log('[USER ACTIONS] - updateUser')
    try {
      await updateUserDoc(user.uid, userPart)
      // todo - must be a better way to merge these if it exists
      if (userPart.bio) user.data.bio = userPart.bio
      if (userPart.displayName) user.data.displayName = userPart.displayName
      if (userPart.photoUrl) user.data.photoUrl = userPart.photoUrl
      log('boooo1', user)
      await dispatch('saveUser', user)
    } catch (error) {
      log('[USER ACTIONS] - caught error', error)
      return Promise.reject(new Error('Error updating user in store'))
    }
  },

  async saveUserByUid({ dispatch }, uid) {
    log('[USER ACTIONS] - saveUserByUid:', uid)
    try {
      const userDoc = await findUserByOid(uid)
      if (userDoc.exists) {
        let user = {
          uid: userDoc.id,
          data: userDoc.data()
        }
        log('[USER ACTIONS] - saving user to store:', user)
        await dispatch('saveUser', user)
      } else {
        return Promise.reject(new Error('User does not exist in the database'))
      }
    } catch (error) {
      log('[USER ACTIONS] - caught error', error)
      return Promise.reject(new Error('Error saving user by UID'))
    }
  }
}

export const mutations = {
  resetState(state) {
    log('[USER MUTATIONS] - resetState')
    Object.assign(state, defaultState())
  },

  saveUser(state, user) {
    log('[USER MUTATIONS] - saveUser:', user)
    state.user = user
  }
}
