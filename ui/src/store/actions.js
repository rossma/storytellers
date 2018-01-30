import * as types from './mutation-types.js'
import { EventBus } from '~/utils/event-bus.js'
import firebaseApp from '~/firebase/app'
import { findUserByOid, updateUserDoc } from '~/service/user'

// nuxtServerInit is called by Nuxt.js before server-rendering every page
export async function nuxtServerInit ({ dispatch, commit }, { app, req }) {
  console.log('[STORE ACTION]- in nuxServerInit')

  if (req.session && req.session.user) {
    console.log(`[STORE ACTION] found user in session:${JSON.stringify(req.session.user)}`)
    await dispatch('saveUser', req.session.user)
  }
}

export async function loadUser ({ dispatch, state }) {
  console.log('[STORE ACTIONS] - loadUser')
  if (state.user && state.user.uid) {
    return state.user
  } else if (state.uid) {
    await dispatch('initialiseUser', state.uid)
    return state.user
  } 
  return
}

export async function logout ({ dispatch }) {
  console.log('[STORE ACTIONS] - logout')
  await firebaseApp.auth().signOut()

  await dispatch('saveUID', null)
  await dispatch('saveUser', null)
  
  const { status } = await this.$axios.post('/logout')
  console.log('[STORE ACTIONS] - in logout, response:', status)
}

export async function login ({ dispatch, state }, uid) {
  console.log('[STORE ACTIONS] - login')
  const token = await firebaseApp.auth().currentUser.getIdToken(true)

  await dispatch('initialiseUser', uid)

  const { status } = await this.$axios.$post('/login', { user: state.user, token: token })
  console.log('[STORE ACTIONS] - in login, response:', status)
}

export async function initialiseUser ({ dispatch }, uid) {
  console.log('[STORE ACTIONS] - initialiseUser:', uid)
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
    throw error('User does not exist in the database')
  }
}

export async function saveUID ({ commit }, uid) {
  console.log('[STORE ACTIONS] - saveUID')
  commit(types.SAVE_UID, uid)
}

export async function saveUser ({ commit }, userPayload) {
  console.log('[STORE ACTIONS] - saveUser')
  commit(types.SAVE_USER, userPayload)
}

export async function saveStory ({ commit }, storyPayload) {
  commit(types.SAVE_STORY, storyPayload)
  EventBus.$emit('storyEvent', storyPayload)
}

export async function savePages ({ commit }, pagesPayload) {
  commit(types.SAVE_PAGES, pagesPayload)
}

export async function updateUser ({ dispatch }, user, userPart) {
  console.log('[STORE ACTIONS] - updateUser')
  await updateUserDoc(user.uid, userPart)
  await dispatch('saveUser', user)
}

