import Vuex from 'vuex'
import { mutations } from './mutations'

import * as actions from './actions'

export const state = () => ({
  user: {
    uid: '',
    displayName: '',
    email: '',
    photoUrl: '',
    created: null
  },
  story: {}
})

const createStore = () => {
  return new Vuex.Store({
    state: state,
    mutations: mutations,
    actions: actions,
    getters: {
      user: state => {
        return state.user
      },
      story: state => {
        return state.story
      },
      pages: state => {
        return state.pages
      }
    }
  })
}

export default createStore
