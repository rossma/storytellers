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
      to="/auth/signup">Not already a user? Sign up</v-btn>

    <v-flex
      xs12
      sm10
      md8
      lg6>
      <v-card>
        <form @submit.prevent="login">
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
import { findUserByOid } from '~/service/user'
import firebaseApp from '~/firebaseApp'
import alertUtil from '~/utils/alert'

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
    ...mapActions([
      'saveUser'
    ]),
    login () {
      // http://nodewebapps.com/2017/06/18/how-do-nodejs-sessions-work/
      firebaseApp.auth().signInWithEmailAndPassword(this.email, this.password).then((firebaseUser) => {
        console.log('[SIGNIN.vue] successful login for user', firebaseUser.email)
        return findUserByOid(firebaseUser.uid)
      }).then((userDoc) => {
        if (userDoc.exists) {
          let user = {
            uid: userDoc.id,
            data: userDoc.data()
          }
          this.saveUser(user)
          return Promise.resolve(user)
        } else {
          console.log("User doesn't exist in DB? should have at sign up...should we save it here anyway?")
          return Promise.reject(new Error('User doesn\'t exist in DB'))
        }
      }).then((user) => {
        console.log('user:', user)
        let loginBody = JSON.stringify({
          user: user
        })

        console.log('login body:', loginBody)

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
        this.$toast.error('Error while authenticating')
        this.alert = alertUtil.raiseAlert('error', error.message)
      })
    }
  }
}
</script>
