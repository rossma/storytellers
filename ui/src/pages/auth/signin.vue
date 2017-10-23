<template>
  <v-layout column align-center>

    <v-btn primary flat nuxt to="/auth/signup">Not already a user? Sign up</v-btn>

    <v-flex xs12 sm10 md8 lg6>
      <v-card>
        <form @submit.prevent="login">
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
            <!--<v-btn success class="elevation-0" @click="submit">Sign In</v-btn>-->
            <button type="submit">Sign In</button>
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
      login () {
        console.log('logging in...')
        this.error = ''
        // http://nodewebapps.com/2017/06/18/how-do-nodejs-sessions-work/

        firebaseApp.auth().signInWithEmailAndPassword(this.username, this.password)
          .then(function (firebaseUser) {
            console.log('[SIGNIN.vue] successful login for user:' + firebaseUser.email)

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
          .catch(err => {
            console.log('form err:' + err)
            this.error = err
          })
      }
    }
  }
</script>