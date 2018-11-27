/*
 * we use authenticated middleware to set the user from uid when route changes but when user refreshes the page
 * the middleware is never called on the client side (using default universal config in nuxt) so we do it here
 */

import { mapActions, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('auth', [
      'uid'
    ]),
    ...mapGetters('user', [
      'user'
    ])
  },
  created: function () {
    this.loadUser()
  },
  methods: {
    ...mapActions('user', [
      'saveUserByUid'
    ]),
    async loadUser () {
      if (!this.user.uid) {
        if (this.uid) {
          console.log('[USER STATE MIXIN] - UID is set but User is not, going to initialise')
          this.saveUserByUid(this.uid).then(() => {
            console.log('[USER STATE MIXIN] - finished saving user to store', this.user)
          }).catch((error) => {
            this.$toast.error(error.message)
          })
        } else {
          console.log('[USER STATE MIXIN] - uid is not initialised, redirecting to login')
          this.$router.push('/auth/signin')
        }
      }
    }
  }
}
