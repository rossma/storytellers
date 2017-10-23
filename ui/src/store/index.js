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
    actions: actions
  })
}

export default createStore
