import debug from 'debug'
const log = debug('app:store/chapter')

const defaultState = () => ({
  active: {
    index: 1,
    chapter: undefined
  }
})

export const state = defaultState

export const getters = {
  activeChapter: state => {
    return state.active
  }
}

export const actions = {
  resetState({ commit }) {
    commit('resetState')
  },

  saveActiveChapter({ commit }, { index, chapter }) {
    commit('saveActiveChapter', { index: index, chapter: chapter })
  }
}

export const mutations = {
  resetState(state) {
    log('resetState')
    Object.assign(state, defaultState())
  },

  saveActiveChapter(state, active) {
    log('saveActiveChapter:', active)
    state.active = active
  }
}
