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
      console.log(' COMMIT SIGN IN FOR STORE  ')
      // commit(types.SIGN_IN, req.session.user)
    ])
  }
  console.log('in nuxServerInit 3')
}

export const signIn = ({commit}, userPayload) => {
  // commit(types.SIGN_IN, userPayload)
}

export const signOut = ({commit}) => {
  commit(types.SIGN_OUT)
}
