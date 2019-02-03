/**
 * MIXIN to ensure that once logged in the user object from the database is correctly set in the store
 */
import { mapActions, mapGetters } from 'vuex'
import debug from 'debug'
const log = debug('app:mixins/UserStateMixin')

export default {
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'uid']),
    ...mapGetters('user', ['user'])
  },
  watch: {
    user(newValue, oldValue) {
      log('User has changed', newValue, oldValue)
    }
  },
  created: function() {
    log('CREATED')
    /* this will run on both client not server */
  },
  beforeMount: function() {
    log('BEFORE MOUNT')
    /* this will only run on client not server */
    this.loadUser()
  },
  mounted: function() {
    this.$nextTick(() => {
      log('MOUNTED')
      /* this will only run on client not server */
    })
  },
  methods: {
    ...mapActions('auth', ['initUserOnAuthStateChange']),
    loadUser() {
      log('loadUser')

      if (!this.user.uid) {
        log('auth uid', this.uid)

        if (this.uid) {
          log('UID is set but User is not, going to initialise')
          // TODO change this so that we call this.initAuthentication() / initUser

          this.initUserOnAuthStateChange()
            .then(user => {
              log('finished saving user to store', user)
              log('user in store', this.user)
            })
            .catch(error => {
              log('Error saving the user by uid', error)
            })
        }
      }
    }
  }
}
