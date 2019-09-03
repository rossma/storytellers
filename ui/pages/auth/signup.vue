<template>
  <v-container
    justify-space-around
    class="auth-container"
  >
    <v-row
      justify="end"
      class="mt-4 mb-6"
      no-gutters
    >
      <v-col class="text-center">
        Already a user?
        <nuxt-link
          to="/auth/signin"
          class="signin-link"
        >
          Sign in
        </nuxt-link>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="text-center">
        <v-card>
          <v-form
            ref="form"
            @submit.prevent="signUp"
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
                  mdi-account-box-outline
                </v-icon>
                Sign Up
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
import { addUser } from '~/api/service/user'
import firebaseApp from 'fire/app'
import debug from 'debug'
const log = debug('app:pages/auth/signup')

export default {
  layout: 'auth',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      alert: {
        show: false
      }
    }
  },
  methods: {
    ...mapActions('auth', ['login']),
    async signUp() {
      log('signing up')

      try {
        const firebaseUser = await firebaseApp
          .auth()
          .createUserWithEmailAndPassword(this.email.trim(), this.password)
        log('successful user creation in firebase', firebaseUser.user.uid)
        const user = {
          uid: firebaseUser.user.uid,
          email: this.email.trim(),
          created: Date.now()
        }
        await addUser(user)
        await this.login(user.uid)
        this.$toast.clear()
        this.$router.push('/')
      } catch (error) {
        this.$toast.error(error.message)
      }
    }
  }
}
</script>
<style scoped>
.signin-link:hover {
  text-decoration: none;
}
</style>
