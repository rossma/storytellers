import * as types from './mutation-types.js'

// export const nuxtServerInit = ({ commit }, { req }) => {
//   console.log('in nuxServerInit')
//   if (req.session && req.session.user) {
//     commit(types.SIGN_IN, req.session.user)
//   }
// }

export const nuxtServerInit = ({ commit }, { req }) => {
  console.log('in nuxServerInit')
  if (req.session && req.session.user) {
    console.log('in nuxServerInit 2:' + JSON.stringify(req.session.user))
    // returning a promise for all AJAX request stuff
    return Promise.all([
      // commit(types.SIGN_IN, req.session.user)
    ])
  }
}

// export const signIn = ({commit}, userPayload) => {
//   commit(types.SIGN_IN, userPayload)
// }

// export const signOut = ({commit}) => {
//   commit(types.SIGN_OUT)
// }

export const saveUser = ({commit}, userPayload) => {
  commit(types.SAVE_USER, userPayload)
}

export const saveStory = ({commit}, storyPayload) => {
  commit(types.SAVE_STORY, storyPayload)
}
