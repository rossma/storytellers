import { findUserByOid, updateUserDoc } from '~/api/service/user'

const defaultState = () => ({
  user: {}
})

export const state = defaultState

export const getters = {

  user (state) {
    console.log('[USER GETTERS] - user', state.user)
    return state.user
  }

}

export const actions = {

  resetState ({ commit }) {
    console.log('[USER ACTIONS] - user reset state')
    commit('resetState')
  },

  saveUser ({ commit }, userPayload) {
    console.log('[USER ACTIONS] - saveUser')
    commit('saveUser', userPayload)
  },

  async updateUser ({ dispatch }, { user, userPart }) {
    console.log('[USER ACTIONS] - updateUser')
    try {
      await updateUserDoc(user.uid, userPart)
      await dispatch('saveUser', user)
    } catch (error) {
      console.log('[USER ACTIONS] - caught error', error)
      return Promise.reject(new Error('Error updating user in store'))
    }
  },

  async saveUserByUid ({ dispatch }, uid) {
    console.log('[USER ACTIONS] - saveUserByUid:', uid)
    try {
      const userDoc = await findUserByOid(uid)
      if (userDoc.exists) {
        let user = {
          uid: userDoc.id,
          data: userDoc.data()
        }
        console.log('[USER ACTIONS] - saving user to store:', user)
        await dispatch('saveUser', user)
      } else {
        return Promise.reject(new Error('User does not exist in the database'))
      }
    } catch (error) {
      console.log('[USER ACTIONS] - caught error', error)
      return Promise.reject(new Error('Error saving user by UID'))
    }
  }

}

export const mutations = {

  resetState (state) {
    console.log('[USER MUTATIONS] - resetState')
    Object.assign(state, defaultState())
  },

  saveUser (state, user) {
    console.log('[USER MUTATIONS] - saveUser:', user)
    state.user = user
  }

}
