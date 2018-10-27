const defaultState = () => ({
  pages: [] // total pages in story
})

export const state = defaultState

export const getters = {

  pages: state => {
    console.log('store...........getPages', state.pages)

    return state.pages
  }

}

export const actions = {

  resetState ({ commit }) {
    commit('resetState')
  },

  async savePages ({ commit }, pagesPayload) {
    console.log('store...........savePages')
    commit('savePages', pagesPayload)
  }

}

export const mutations = {

  resetState (state) {
    console.log('[PAGE MUTATIONS] - resetState')
    Object.assign(state, defaultState())
  },

  savePages (state, pages) {
    console.log('[PAGE MUTATIONS] - savePages:', pages)
    state.pages = pages
  }

}
