import debug from 'debug'
const log = debug('app:store/page')

const defaultState = () => ({
  pages: [], // total pages in story
  active: {
    index: 1,
    page: undefined
  }
})

export const state = defaultState

export const getters = {
  pages: state => {
    return state.pages
  },
  activePage: state => {
    return state.active
  }
}

export const actions = {
  resetState({ commit }) {
    commit('resetState')
  },

  savePages({ commit }, pagesPayload) {
    commit('savePages', pagesPayload)
  },

  saveActivePage({ commit }, { index, page }) {
    commit('saveActivePage', { index: index, page: page })
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
  },

  saveActivePage(state, active) {
    log('saveActivePage:', active)
    state.active = active
  }
}
