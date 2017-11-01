import Vuex from 'vuex'
import { mutations } from './mutations'
// import * as types from './mutation-types.js'

import * as actions from './actions'

export const state = () => ({
  user: {}
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
      }
    }
  })
}

export default createStore
