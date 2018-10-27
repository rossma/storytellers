<template>
  <v-layout
    column
    align-center
    justify-center>
    <nuxt-link
      to="/auth/signup"
      class="signin-link">Not already a user? Sign up</nuxt-link>
    <v-flex
      xs12
      sm10
      md8
      lg6>
      <v-card>
        <form @submit.prevent="submit">
          <v-card-text ref="form">
            <v-text-field
              v-model="email"
              label="email"/>
            <v-text-field
              v-model="password"
              :append-icon="showPassword ? 'visibility' : 'visibility_off'"
              :type="showPassword ? 'text' : 'password'"
              name="password-in-txt"
              label="password"
              @click:append="showPassword = !showPassword"
            />
          </v-card-text>
          <v-divider class="mt-5"/>
          <v-card-actions>
            <v-btn
              flat
              color="blue darken-1"
              type="submit">Sign In</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex'
import firebaseApp from '~/firebase/app'

export default {
  layout: 'auth',
  data () {
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
    ...mapActions('modules/user', [
      'login'
    ]),
    submit () {
      firebaseApp.auth().signInWithEmailAndPassword(this.email, this.password).then((firebaseUser) => {
        return this.login(firebaseUser.uid)
      }).then(() => {
        this.$toast.clear();
        this.$router.push('/')
      }).catch((error) => {
        this.$toast.error(error.message)
      })
    }
  }
}
</script>
<style>
.signin-link:hover {
  text-decoration: none;
}
</style>
