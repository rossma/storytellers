/**
 * MIXIN to ensure that once logged in the user object from the database is correctly set in the store
 */
import { mapActions, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('auth', [
      'isAuthenticated', 'uid'
    ]),
    ...mapGetters('user', [
      'user'
    ])
  },
  created: function () {
    console.log('[USER STATE MIXIN] - CREATED')
    /* this will run on both client not server */
  },
  beforeMount: function () {
    console.log('[USER STATE MIXIN] - BEFORE MOUNT')
    /* this will only run on client not server */
    this.loadUser()
  },
  mounted: function () {
    this.$nextTick(() => {
      console.log('[USER STATE MIXIN] - MOUNTED')
      /* this will only run on client not server */
    })
  },
  methods: {
    ...mapActions('auth', [
      'initUserOnAuthStateChange'
    ]),
    loadUser () {
      console.log('[USER STATE MIXIN] - loadUser')

      if (!this.user.uid) {
        console.log('[USER STATE MIXIN] - auth uid', this.uid)

        if (this.uid) {
          console.log('[USER STATE MIXIN] - UID is set but User is not, going to initialise')
          // TODO change this so that we call this.initAuthentication() / initUser

          this.initUserOnAuthStateChange().then((user) => {
            console.log('[USER STATE MIXIN] - finished saving user to store', user)
            console.log('[USER STATE MIXIN] - user in store', this.user)
          }).catch((error) => {
            console.log('Error saving the user by uid', error)
          })
        }
      }
    }
  }
}
