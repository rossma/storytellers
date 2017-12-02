<template>
  <v-layout
    column
    align-center>

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
            <p
              class="error"
              v-if="error">{{ error.message }}</p>
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
import firebaseApp from '~/firebaseApp'
const db = firebaseApp.firestore()

export default {
  layout: 'auth',
  data () {
    return {
      email: '',
      password: null,
      showPassword: false,
      error: null
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
      this.error = ''
      firebaseApp.auth().createUserWithEmailAndPassword(this.email, this.password)
        .then(function (firebaseUser) {
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

          let docRef = db.collection('users').doc(user.uid)
          docRef.set(user.data)
          this.saveUser(user)
          return Promise.resolve(user)
        }.bind(this)).then(function (user) {
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
          }).then((response) => {
            console.log('User state saved in session, status:' + response.status)
            this.$router.push('/')
          })
        }.bind(this)).catch(error => {
          this.error = error
        })
    }
  }
}
</script>
