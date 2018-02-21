
export const state = () => ({
  pages: []
})

export const getters = {

  pages: state => {
    return state.pages
  }

}

export const actions = {

  async savePages ({ commit }, pagesPayload) {
    commit('savePages', pagesPayload)
  }

}

export const mutations = {

  savePages (state, pages) {
    console.log('[STORE MUTATIONS] - savePages:', pages)
    state.pages = pages
  }

}
