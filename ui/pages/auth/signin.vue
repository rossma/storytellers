<template>
  <v-layout column align-center justify-center>
    <span>
      Not already a user?
      <nuxt-link to="/auth/signup" class="signin-link">Sign up</nuxt-link></span>
    <v-flex xs12 sm10 md8 lg6>
      <v-card>
        <form @submit.prevent="submit">
          <v-card-text ref="form">
            <v-text-field v-model="email" label="email" />
            <v-text-field
              v-model="password"
              :append-icon="showPassword ? 'visibility' : 'visibility_off'"
              :type="showPassword ? 'text' : 'password'"
              name="password-in-txt"
              label="password"
              @click:append="showPassword = !showPassword"
            />
          </v-card-text>
          <v-divider class="mt-5" />
          <v-card-actions>
            <v-btn color="pink darken-1" type="submit">
              Sign In
            </v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import firebaseApp from 'fire/app'
// import { namespace } from 'vuex-class'
import { Action } from 'vuex-class'

@Component({
  layout: () => 'auth'
})
export default class SignIn extends Vue {
  @Action('login') login

  // layout: 'auth'

  showPassword: boolean = false
  // alert: {
  //       show: false
  //     },
  email: string = ''
  password: string = ''

  submit() {
    firebaseApp
      .auth()
      .signInWithEmailAndPassword(this.email.trim(), this.password)
      .then(firebaseUser => {
        if (firebaseUser && firebaseUser.user) {
          return this.login(firebaseUser.user.uid)
        } else {
          return Promise.resolve()
        }
      })
      .then(() => {
        this.$toast.clear()
        this.$router.push('/')
      })
      .catch(error => {
        this.$toast.error(error.message)
      })
  }
}
</script>
<style scoped>
.signin-link:hover {
  text-decoration: none;
}
</style>
