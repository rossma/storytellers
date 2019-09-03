<template>
  <v-container
    justify-space-around
    class="auth-container"
  >
    <v-row
      justify="end"
      class="mt-2 mb-6"
      no-gutters
    >
      <v-col class="text-center">
        <v-tooltip top>
          <template #activator="{ on }">
            <v-btn
              large
              class="mt-1"
              color="negative"
              v-on="on"
              @click="googleSignIn"
            >
              <v-icon>mdi-google</v-icon>
            </v-btn>
          </template>
          <span>Sign in with Google?</span>
        </v-tooltip>
      </v-col>
      <v-col class="text-center">
        <v-tooltip top>
          <template #activator="{ on }">
            <v-btn
              large
              class="mt-1"
              color="blue"
              v-on="on"
              @click="facebookSignIn"
            >
              <v-icon>mdi-facebook</v-icon>
            </v-btn>
          </template>
          <span>Sign in with Facebook?</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-divider class="mb-4" />
    <v-row
      class="mb-1"
      no-gutters
    >
      <v-col class="text-center">
        Not already a user?
        <nuxt-link
          to="/auth/signup"
          class="signin-link"
        >
          Sign up
        </nuxt-link>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="text-center">
        <v-card>
          <v-form
            ref="form"
            @submit.prevent="submit"
          >
            <v-card-text>
              <v-text-field
                v-model="email"
                label="email"
              />
              <v-text-field
                v-model="password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                name="password-in-txt"
                label="password"
                @click:append="showPassword = !showPassword"
              />
            </v-card-text>
            <v-divider class="mt-12" />
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                type="submit"
              >
                <v-icon float-left>
                  mdi-lock-open-outline
                </v-icon>
                Sign In
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
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
