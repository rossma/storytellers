<template>
  <v-layout column align-center>
    <v-btn color="primary" flat nuxt to="/auth/signup">Not already a user? Sign up</v-btn>

    <v-flex xs12 sm10 md8 lg6>
      <v-card>
        <form @submit.prevent="login">
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
  const db = firebaseApp.firestore()

  export default {
    layout: 'auth',
    data () {
      return {
        showPassword: false,
        error: null,
        password: '',
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
      login () {
        this.error = ''
        // http://nodewebapps.com/2017/06/18/how-do-nodejs-sessions-work/

        firebaseApp.auth().signInWithEmailAndPassword(this.user.email, this.password)
          .then(function (firebaseUser) {
            console.log('[SIGNIN.vue] successful login for user', firebaseUser.email)

            let docRef = db.collection('users').doc(firebaseUser.uid)

            docRef.get().then(function (doc) {
              if (doc.exists) {
                this.user = doc.data()
                this.$store.dispatch('saveUser', this.user)
              } else {
                console.log("User doesn't exist in DB?? should have at sign up...should we save it here anyway?")
              }
            }.bind(this))
          }.bind(this)).then(function () {
            let loginBody = JSON.stringify({
              user: this.user
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
              .then((response) => {
                console.log('User state saved in session, status:' + response.status)
                this.$router.push('/')
              })
          }.bind(this))
          .catch(err => {
            console.log('form err:', err)
            this.error = err
          })
      }
    }
  }
</script>