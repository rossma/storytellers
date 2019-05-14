import { EventBus } from '~/utils/event-bus.js'
import debug from 'debug'
import { Story } from '~/types'
const log = debug('app:store/story')

const defaultState = (): Story => ({
  story: {}
})

export const state = defaultState

export const getters = {
  story: state => {
    return state.story
  }
}

export const actions = {
  resetState({ commit }) {
    commit('resetState')
  },

  saveStory({ commit }, storyPayload) {
    commit('saveStory', storyPayload)
    EventBus.$emit('storyEvent', storyPayload)
  }
}

export const mutations = {
  resetState(state) {
    log('resetState')
    Object.assign(state, defaultState())
  },

  saveStory(state, story) {
    log('saveStory:', story)
    state.story = story
  }
}
