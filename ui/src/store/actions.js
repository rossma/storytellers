import * as types from './mutation-types.js'
import { EventBus } from '~/utils/event-bus.js'

export const nuxtServerInit = ({ commit }, { req }) => {
  if (req.session && req.session.user) {
    console.log('[STORE ACTION]- in nuxServerInit:' + JSON.stringify(req.session.user))
    return Promise.all([
      commit(types.SAVE_USER, req.session.user)
    ])
  }
}

export const saveUser = ({commit}, userPayload) => {
  commit(types.SAVE_USER, userPayload)
}

export const saveStory = ({commit}, storyPayload) => {
  commit(types.SAVE_STORY, storyPayload)
  EventBus.$emit('storyEvent', storyPayload)
}

export const savePages = ({commit}, pagesPayload) => {
  commit(types.SAVE_PAGES, pagesPayload)
}
