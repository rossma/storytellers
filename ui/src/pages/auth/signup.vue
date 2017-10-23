<template>
  <v-layout column align-center>

    <v-btn primary flat nuxt to="/auth/signin">Already a user? Sign in</v-btn>

    <v-flex xs12 sm10 md8 lg6>
      <v-card>
        <form @submit.prevent="signUp">
          <v-card-text ref="form">
            <p class="error" v-if="error">{{ error }}</p>
            <v-text-field
                label="email"
                v-model="username"
            ></v-text-field>
            <v-text-field
                name="password-in-txt"
                label="password"
                v-model="password"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                :append-icon-cb="() => (showPassword = !showPassword)"
                :type="showPassword ? 'password' : 'text'"
                counter
            ></v-text-field>
          </v-card-text>
          <v-divider class="mt-5"></v-divider>
          <v-card-actions>
            <button type="submit">Sign Up</button>
          </v-card-actions>
        </form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import firebaseApp from '~/firebaseApp'

  export default {
    data () {
      return {
        showPassword: false,
        error: null,
        username: '',
        password: ''
      }
    },
    methods: {
      submit () {
        this.$refs.form.$el.submit()
      },
      signUp () {
        console.log('[SIGNUP] signing up')
        this.error = ''
        firebaseApp.auth().createUserWithEmailAndPassword(this.username, this.password)
          .then(function (firebaseUser) {
            console.log('[SIGNUP.vue] successful user creation:' + firebaseUser.email)

            let loginBody = JSON.stringify({
              user: firebaseUser
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
              .then((response) => {
                console.log('User state saved in session, status:' + response.status)
                this.$router.push('/')
              })
          }.bind(this))
          .catch(error => {
            this.error = error
          })
      }
    }
  }
</script>