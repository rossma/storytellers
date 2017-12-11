import * as types from './mutation-types.js'

export const nuxtServerInit = ({ commit }, { req }) => {
  if (req.session && req.session.user) {
    console.log('[STORE ACTION]- in nuxServerInit:' + JSON.stringify(req.session.user))
    return Promise.all([
      commit(types.SAVE_USER, req.session.user)
    ])
  }
}

export const saveUser = ({commit}, userPayload) => {
  console.log('...........................Saving user2:', userPayload)
  commit(types.SAVE_USER, userPayload)
}

export const saveStory = ({commit}, storyPayload) => {
  commit(types.SAVE_STORY, storyPayload)
}
