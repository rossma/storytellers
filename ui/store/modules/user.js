import firebaseApp from '~/firebase/app'
import { findUserByOid, updateUserDoc } from '~/api/service/user'

const defaultState = () => ({
  uid: null,
  user: {}
})

export const state = defaultState

export const getters = {

  uid (state) {
    return state.uid
  },

  user (state) {
    console.log('[USER GETTERS] - user', state.user)
    return state.user
  },

  isAuthenticated (state) {
    return !!state.uid || !!state.user.uid
  }

}

export const actions = {

  resetState ({ commit }) {
    console.log('[USER ACTIONS] - user reset state')
    commit('resetState')
  },

  async login ({ dispatch, state }, uid) {
    console.log('[USER ACTIONS] - login')
    const token = await firebaseApp.auth().currentUser.getIdToken(true)

    const { status } = await this.$axios.$post('/login', { user: state.user, token: token })

    console.log('[USER ACTIONS] - in login, response:', status)

    await dispatch('saveUserByUid', uid)
  },

  async logout ({ dispatch }) {
    console.log('[USER ACTIONS] - logout')
    await firebaseApp.auth().signOut()

    await dispatch('resetState')

    const { status } = await this.$axios.post('/logout')
    console.log('[USER ACTIONS] - in logout, response:', status)
  },

  saveUID ({ commit }, uid) {
    console.log('[USER ACTIONS] - saveUID')
    commit('saveUID', uid)
  },

  saveUser ({ commit }, userPayload) {
    console.log('[USER ACTIONS] - saveUser')
    commit('saveUser', userPayload)
  },

  async updateUser ({ dispatch }, { user, userPart }) {
    console.log('[USER ACTIONS] - updateUser')
    await updateUserDoc(user.uid, userPart)
    await dispatch('saveUser', user)
  },

  async saveUserByUid ({ dispatch }, uid) {
    console.log('[USER ACTIONS] - saveUserByUid:', uid)
    await dispatch('saveUID', uid)

    const userDoc = await findUserByOid(uid)
    if (userDoc.exists) {
      let user = {
        uid: userDoc.id,
        data: userDoc.data()
      }
      console.log('[USER ACTIONS] - saving user to store:', user)
      await dispatch('saveUser', user)
    } else {
      throw new Error('User does not exist in the database')
    }
  }

}

export const mutations = {

  resetState (state) {
    console.log('[USER MUTATIONS] - resetState')
    Object.assign(state, defaultState())
  },

  saveUID (state, uid) {
    console.log('[USER MUTATIONS] - saveUID:', uid)
    state.uid = uid
  },

  saveUser (state, user) {
    console.log('[USER MUTATIONS] - saveUser:', user)
    state.user = user
  }

}
