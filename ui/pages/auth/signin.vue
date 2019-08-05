<template>
  <v-container
    grid-list-md
  >
    <v-layout
      align-center
      column
      wrap
    >
      <v-flex
        xs12
        mb-1
      >
        <v-tooltip top>
          <template #activator="{ on }">
            <v-btn
              outline
              color="red"
              v-on="on"
              @click="googleSignIn"
            >
              <v-icon>lock_open</v-icon>
            </v-btn>
          </template>
          <span>Sign in with Google?</span>
        </v-tooltip>
        <v-tooltip top>
          <template #activator="{ on }">
            <v-btn
              outline
              color="blue"
              v-on="on"
              @click="facebookSignIn"
            >
              <v-icon>lock_open</v-icon>
            </v-btn>
          </template>
          <span>Sign in with Facebook?</span>
        </v-tooltip>
      </v-flex>
      <v-flex
        xs12
        sm10
        md8
        mb-1
      >
        Not already a user?
        <nuxt-link
          to="/auth/signup"
          class="signin-link"
        >
          Sign up
        </nuxt-link>
      </v-flex>
      <v-flex
        xs12
        sm10
        md8
        lg6
      >
        <v-card>
          <form @submit.prevent="submit">
            <v-card-text ref="form">
              <v-text-field
                v-model="email"
                label="email"
              />
              <v-text-field
                v-model="password"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                :type="showPassword ? 'text' : 'password'"
                name="password-in-txt"
                label="password"
                @click:append="showPassword = !showPassword"
              />
            </v-card-text>
            <v-divider class="mt-5" />
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                type="submit"
              >
                <v-icon left>
                  lock_open
                </v-icon>
                Sign In
              </v-btn>
            </v-card-actions>
          </form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { FBASE, GOOGLE_PROVIDER, FACEBOOK_PROVIDER } from 'fire/app'
import debug from 'debug'
import { findUserByOid, addUser } from '~/api/service/user'
const log = debug('app:components/SignIn')

export default {
  layout: 'auth',
  data() {
    return {
      showPassword: false,
      alert: {
        show: false
      },
      email: '',
      password: ''
    }
  },
  methods: {
    ...mapActions('auth', ['login']),
    googleSignIn() {
      this.loginUser(FBASE.auth().signInWithPopup(GOOGLE_PROVIDER))
    },
    facebookSignIn() {
      this.loginUser(FBASE.auth().signInWithPopup(FACEBOOK_PROVIDER))
    },
    submit() {
      this.loginUser(
        FBASE.auth().signInWithEmailAndPassword(
          this.email.trim(),
          this.password
        )
      )
    },
    loginUser(loginMethod) {
      loginMethod
        .then(async firebaseUser => {
          log('result.........................', firebaseUser)
          const userDoc = await findUserByOid(firebaseUser.user.uid)
          if (!userDoc.exists) {
            const user = {
              uid: firebaseUser.user.uid,
              email: firebaseUser.user.email,
              created: Date.now()
            }
            await addUser(user)
          }
          return this.login(firebaseUser.user.uid)
        })
        .then(() => {
          this.$toast.clear()
          this.$router.push('/')
        })
        .catch(error => {
          this.$toast.error(error.message)
        })
    }
  }
}
</script>
<style scoped>
.signin-link:hover {
  text-decoration: none;
}
</style>
