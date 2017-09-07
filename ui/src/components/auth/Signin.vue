<template>
  <div>
    <h3>Sign In</h3>
    <div>
      <input type="text" placeholder="email" v-model="email" />
      <input type="password" placeholder="password" v-model="password" />
      <button @click="signIn">Sign In</button>
    </div>
    <br>
    <p>{{ error.message }}</p>
    <br>
    <router-link to="/signup">Not already a user? Sign up</router-link>
  </div>
</template>

<script>
  import { firebaseApp } from '../../firebaseApp'

  export default {
    data() {
      return {
        email: '',
        password: '',
        error: {
          message: ''
        }
      }
    },
    methods: {
      signIn() {
        firebaseApp.auth().signInWithEmailAndPassword(this.email, this.password)
          .catch(error => {
            this.error = error
          })
      }
    }
  }
</script>