import { EventBus } from '~/utils/event-bus.js'

const defaultState = () => ({
  story: {}
})

export const state = defaultState

export const getters = {

  story: state => {
    return state.story
  }

}

export const actions = {

  resetState ({ commit }) {
    commit('resetState')
  },

  async saveStory ({ commit }, storyPayload) {
    commit('saveStory', storyPayload)
    EventBus.$emit('storyEvent', storyPayload)
  }

}

export const mutations = {

  resetState (state) {
    console.log('[STORY MUTATIONS] - resetState')
    Object.assign(state, defaultState())
  },

  saveStory (state, story) {
    console.log('[STORY MUTATIONS] - saveStory:', story)
    state.story = story
  }

}
