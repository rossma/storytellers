import { EventBus } from '~/utils/event-bus.js'

export const state = () => ({
  story: {}
})

export const getters = {

  story: state => {
    return state.story
  }

}

export const actions = {

  async saveStory ({ commit }, storyPayload) {
    commit('saveStory', storyPayload)
    EventBus.$emit('storyEvent', storyPayload)
  }

}

export const mutations = {

  saveStory (state, story) {
    console.log('[STORE MUTATIONS] - saveStory:', story)
    state.story = story
  }

}
