import debug from 'debug'
const log = debug('app:store/common')

const defaultState = () => ({
  sidebar: {
    visible: false
  },
  title: '',
  layout: 'DefaultLayout',
  dialog: {
    visible: false,
    text: ''
  },
  snackbar: {
    visible: false,
    text: '',
    timeout: 6000,
    color: ''
  },
  error: {
    code: null,
    level: null,
    message: ''
  }
})

export const state = defaultState

export const getters = {
  sidebar(state) {
    return state.sidebar
  }
}

export const actions = {
  resetState({ dispatch, commit }) {
    log('reset state')
    commit('resetState')
  },

  // async saveStory ({ commit }, storyPayload) {
  //   commit('saveStory', storyPayload)
  // }

  updateSidebar({ commit }, options) {
    commit('updateSidebar', options)
  },

  updateTitle({ commit }, title) {
    commit('updateTitle', title)
  },

  updateLayout({ commit }, layout) {
    commit('updateLayout', layout)
  },

  updateDialog({ commit }, options) {
    commit('updateDialog', options)
  },

  updateSnackbar({ commit }, options) {
    commit('updateSnackbar', options)
  }
}

export const mutations = {
  resetState(state) {
    log('[COMMON MUTATIONS] - resetState')
    Object.assign(state, defaultState())
  },

  updateSidebar(state, options) {
    state.sidebar = Object.assign({}, defaultState.sidebar, options)
  },

  updateTitle(state, title) {
    state.title = title
  },

  updateLayout(state, layout) {
    state.layout = layout
  },

  updateDialog(state, options) {
    state.dialog = Object.assign({}, defaultState.dialog, options)
  },

  updateSnackbar(state, options) {
    state.snackbar = Object.assign({}, defaultState.snackbar, options)
  },

  error(state, options) {
    state.error = Object.assign({}, defaultState.error, options)
  }
}
