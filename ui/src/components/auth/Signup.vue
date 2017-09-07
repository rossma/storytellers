<template>
  <div>
    <h3>Sign Up</h3>
    <div>
      <input type="text" placeholder="email" v-model="email" />
      <input type="password" placeholder="password" v-model="password" />
      <button @click="signUp">Sign Up</button>
    </div>
    <br>
    <p>{{ error.message }}</p>
    <br>
    <router-link to="/signin">Already a user? Sign in</router-link>
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
      signUp() {
        firebaseApp.auth().createUserWithEmailAndPassword(this.email, this.password)
          .catch(error => {
            this.error = error
          })
      }
    }
  }
</script>