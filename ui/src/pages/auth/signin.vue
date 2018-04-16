<template>
  <v-layout
    column
    align-center
    justify-center>
    <v-btn
      color="primary"
      flat
      nuxt
      to="/auth/signup">Not already a user? Sign up</v-btn>
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
              :append-icon-cb="() => (showPassword = !showPassword)"
              :type="showPassword ? 'password' : 'text'"
              name="password-in-txt"
              label="password"
              counter
            />
          </v-card-text>
          <v-divider class="mt-5"/>
          <v-card-actions>
            <button type="submit">Sign In</button>
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
        this.$router.push('/')
      }).catch((error) => {
        this.$toast.error(error.message)
      })
    }
  }
}
</script>
