import debug from 'debug'
import { Common } from '~/types'
const log = debug('app:store/common')

const defaultState = (): Common => ({
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
    code: undefined,
    level: undefined,
    message: ''
  }
})

export const state = defaultState

export const getters = {
  sidebar(state: Common) {
    return state.sidebar
  }
}

export const actions = {
  resetState({ commit }) {
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
  resetState(state: Common) {
    log('[COMMON MUTATIONS] - resetState')
    Object.assign(state, defaultState())
  },

  updateSidebar(state: Common, options: any) {
    state.sidebar = Object.assign({}, defaultState().sidebar, options)
  },

  updateTitle(state: Common, title: string) {
    state.title = title
  },

  updateLayout(state: Common, layout: string) {
    state.layout = layout
  },

  updateDialog(state: Common, options: any) {
    state.dialog = Object.assign({}, defaultState().dialog, options)
  },

  updateSnackbar(state: Common, options: any) {
    state.snackbar = Object.assign({}, defaultState().snackbar, options)
  },

  error(state: Common, options: any) {
    state.error = Object.assign({}, defaultState().error, options)
  }
}
