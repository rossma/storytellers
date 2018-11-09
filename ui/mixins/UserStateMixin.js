/*
 * we use authenticated middleware to set the user from uid when route changes but when user refreshes the page
 * the middleware is never called on the client side (using default universal config in nuxt) so we do it here
 */

import { mapActions, mapGetters } from 'vuex'

export default {
  data () {
    return {
      savedUser: 'ssss'
    }
  },
  computed: {
    ...mapGetters('modules/user', [
      'uid', 'user'
    ])
  },
  watch: {
    user () {
      console.log('The counter has changed!')
    }
  },
  created: function () {
    console.log('<<<< before create..............................')
    // this.user2()
    this.savedUser = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    this.loadUser()
  },
  methods: {
    ...mapActions('modules/user', [
      'saveUserByUid'
    ]),
    user2 () {
      console.log('hello', this.user)
      return this.user
    },
    async loadUser () {
      if (!this.user.uid) {
        if (this.uid) {
          console.log('[USER STATE MIXIN] - UID is set but User is not, going to initialise')
          // await this.saveUserByUid(this.uid)
          this.saveUserByUid(this.uid).then(() => {
            console.log('finished saving user to store', this.user)
          }).catch((error) => {
            this.$toast.error(error.message)
          })

          console.log('user here:', await this.user.data)
          // this.user.then((u) => console.log('ssmeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeE:', u))
        } else {
          console.log('[USER STATE MIXIN] - uid is not initialised, redirecting to login')
          this.$router.push('/auth/signin')
        }
      }
      console.log('<<<< before create..............................3', JSON.stringify(this.user))
      const usr = this.$store.getters['modules/user/user']
      console.log('ssssss:::::::', JSON.stringify(usr))
      // this.savedUser = this.user
    }
  }
}
