require('bootstrap/dist/css/bootstrap.css')
require('./assets/main.css')

import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import { firebaseApp } from './firebaseApp'

var config = require('config');

Vue.use(VueRouter)

import store from './store'

import Dashboard from './components/Dashboard.vue'
import SignIn from './components/auth/Signin.vue'
import SignUp from './components/auth/Signup.vue'

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/dashboard', component: Dashboard },
    { path: '/signIn', component: SignIn },
    { path: '/signUp', component: SignUp }
  ]
})

firebaseApp.auth().onAuthStateChanged(user => {
  // console.log("auth:" + user)
  if (user) {
    store.dispatch('signIn', user)
    router.push('/dashboard')
  } else {
    router.replace('/signin')
  }
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
