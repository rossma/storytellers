<template>
  <v-layout
    column
    align-center
    justify-center
  >
    <span>
      Already a user?
      <nuxt-link
        to="/auth/signin"
        class="signin-link"
      >Sign in</nuxt-link></span>
    <v-flex
      xs12
      sm10
      md8
      lg6
    >
      <v-card>
        <form @submit.prevent="signUp">
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
            <v-btn
              color="pink darken-1"
              type="submit"
            >
              Sign Up
            </v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-flex>
  </v-layout>
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
    ...mapActions('user', ['saveUser']),
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
