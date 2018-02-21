import firebaseApp from '~/firebase/app'
import { findUserByOid, updateUserDoc } from '~/api/service/user'

export const state = () => ({
  uid: null,
  user: null
})

export const getters = {

  uid (state) {
    return state.uid
  },

  user (state) {
    console.log('[STORE GETTERS] - user', state.user)
    return state.user
  },

  isAuthenticated (state) {
    return !!state.uid || !!state.user
  }

}

export const actions = {

  async login ({ dispatch, state }, uid) {
    console.log('[STORE ACTIONS] - login')
    const token = await firebaseApp.auth().currentUser.getIdToken(true)

    const { status } = await this.$axios.$post('/login', { user: state.user, token: token })

    console.log('[STORE ACTIONS] - in login, response:', status)

    await dispatch('saveUserByUid', uid)
  },

  async logout ({ dispatch }) {
    console.log('[STORE ACTIONS] - logout')
    await firebaseApp.auth().signOut()

    await dispatch('saveUID', null)
    await dispatch('saveUser', null)

    const { status } = await this.$axios.post('/logout')
    console.log('[STORE ACTIONS] - in logout, response:', status)
  },

  saveUID ({ commit }, uid) {
    console.log('[STORE ACTIONS] - saveUID')
    commit('saveUID', uid)
  },

  saveUser ({ commit }, userPayload) {
    console.log('[STORE ACTIONS] - saveUser')
    commit('saveUser', userPayload)
  },

  async updateUser ({ dispatch }, user, userPart) {
    console.log('[STORE ACTIONS] - updateUser')
    await updateUserDoc(user.uid, userPart)
    await dispatch('saveUser', user)
  },

  async saveUserByUid ({ dispatch }, uid) {
    console.log('[STORE ACTIONS] - saveUserByUid:', uid)
    await dispatch('saveUID', uid)

    const userDoc = await findUserByOid(uid)
    if (userDoc.exists) {
      let user = {
        uid: userDoc.id,
        data: userDoc.data()
      }
      console.log('[STORE ACTIONS] - saving user to store:', user)
      await dispatch('saveUser', user)
    } else {
      throw new Error('User does not exist in the database')
    }
  }

}

export const mutations = {
  saveUID (state, uid) {
    console.log('[STORE MUTATIONS] - saveUID:', uid)
    state.uid = uid
  },

  saveUser (state, user) {
    console.log('[STORE MUTATIONS] - saveUser:', user)
    state.user = user
  }

}
