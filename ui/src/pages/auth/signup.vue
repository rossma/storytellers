<template>
  <v-layout
    column
    align-center>
    <v-alert
      outline
      :color="alert.colour"
      :icon="alert.icon"
      v-model="alert.show"
      dismissible>
      {{ alert.message }}
    </v-alert>
    <v-btn
      color="primary"
      flat
      nuxt
      to="/auth/signin">Already a user? Sign in</v-btn>

    <v-flex
      xs12
      sm10
      md8
      lg6>
      <v-card>
        <form @submit.prevent="signUp">
          <v-card-text ref="form">
            <v-text-field
              label="email"
              v-model="email" />
            <v-text-field
              name="password-in-txt"
              label="password"
              v-model="password"
              :append-icon="showPassword ? 'visibility' : 'visibility_off'"
              :append-icon-cb="() => (showPassword = !showPassword)"
              :type="showPassword ? 'password' : 'text'"
              counter/>
          </v-card-text>
          <v-divider class="mt-5" />
          <v-card-actions>
            <button type="submit">Sign Up</button>
          </v-card-actions>
        </form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex'
import { addUser } from '~/service/user'
import firebaseApp from '~/firebaseApp'
import alertUtil from '~/utils/alert'

export default {
  layout: 'auth',
  data () {
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
    ...mapActions([
      'saveUser'
    ]),
    submit () {
      this.$refs.form.$el.submit()
    },
    signUp () {
      console.log('[SIGNUP] signing up')
      firebaseApp.auth().createUserWithEmailAndPassword(this.email, this.password).then((firebaseUser) => {
        console.log('[SIGNUP.vue] successful user creation in firebase', firebaseUser.email)
        let user = {
          uid: firebaseUser.uid,
          data: {
            email: this.email,
            displayName: '',
            photoUrl: '',
            created: Date.now()
          }
        }
        return addUser(user)
      }).then((user) => {
        this.saveUser(user)
        return Promise.resolve(user)
      }).then((user) => {
        let loginBody = JSON.stringify({
          user: user
        })

        console.log('login body:' + loginBody)

        return fetch('/api/login', {
          // Send the client cookies to the server
          credentials: 'same-origin',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: loginBody
        })
      }).then((response) => {
        console.log('User state saved in session, status:' + response.status)
        this.$router.push('/')
      }).catch(error => {
        this.alert = alertUtil.raiseAlert('error', error.message)
      })
    }
  }
}
</script>
