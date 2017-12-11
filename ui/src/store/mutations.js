/* If adding a new property to the state object that isn't declared in actions.state then to get it to be reactive
   you need to import Vue from 'vue' and then use Vue.set. See: https://vuejs.org/v2/api/#Vue-set and https://vuex.vuejs.org/en/mutations.html */

import * as types from './mutation-types'

export const mutations = {

  [types.SAVE_USER] (state, userPayload) {
    console.log('.......................Saving user:', userPayload)
    state.user = userPayload
  },

  [types.SAVE_STORY] (state, storyPayload) {
    state.story = storyPayload
  }

}
