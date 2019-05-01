import debug from 'debug'
const log = debug('app:store/page')

const defaultState = () => ({
  pages: [] // total pages in story
})

export const state = defaultState

export const getters = {
  pages: state => {
    return state.pages
  }
}

export const actions = {
  resetState({ commit }) {
    commit('resetState')
  },

  savePages({ commit }, pagesPayload) {
    commit('savePages', pagesPayload)
  }
}

export const mutations = {
  resetState(state) {
    log('resetState')
    Object.assign(state, defaultState())
  },

  savePages(state, pages) {
    log('savePages:', pages)
    state.pages = pages
  }
}
