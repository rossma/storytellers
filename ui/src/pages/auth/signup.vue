<template>
  <v-layout column align-center>

    <v-btn color="primary" flat nuxt to="/auth/signin">Already a user? Sign in</v-btn>

    <v-flex xs12 sm10 md8 lg6>
      <v-card>
        <form @submit.prevent="signUp">
          <v-card-text ref="form">
            <p class="error" v-if="error">{{ error.message }}</p>
            <v-text-field label="email" v-model="user.email"></v-text-field>
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
  const db = firebaseApp.firestore()

  export default {
    layout: 'auth',
    data () {
      return {
        showPassword: false,
        error: null,
        user: {
          email: '',
          displayName: '',
          photoUrl: '',
          created: Date.now()
        }
      }
    },
    methods: {
      submit () {
        this.$refs.form.$el.submit()
      },
      signUp () {
        console.log('[SIGNUP] signing up')
        this.error = ''
        firebaseApp.auth().createUserWithEmailAndPassword(this.user.email, this.password)
          .then(function (firebaseUser) {
            console.log('[SIGNUP.vue] successful user creation in firebase', firebaseUser.email)
            let docRef = db.collection('users').doc(firebaseUser.uid)
            docRef.set(this.user)
            this.$store.dispatch('saveUser', this.user)
          }.bind(this)).then(function () {
            let loginBody = JSON.stringify({
              user: this.user
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