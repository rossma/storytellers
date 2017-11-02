import Vue from 'vue'

import * as types from './mutation-types'

export const mutations = {
  // [types.SIGN_IN] (state, userPayload) {
  //   state.user = userPayload
  // },

  // [types.SIGN_OUT] (state) {
  //   state.user = {}
  // }

  [types.SAVE_USER] (state, userPayload) {
    // https://vuejs.org/v2/api/#Vue-set
    Vue.set(state.user, userPayload)
  },

  [types.SAVE_STORY] (state, storyPayload) {
    // state.story = storyPayload
    // https://vuejs.org/v2/api/#Vue-set
    Vue.set(state.story = storyPayload)
  }

}
