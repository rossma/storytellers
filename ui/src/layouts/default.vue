<template>
  <v-app id="example-1" toolbar footer dark>
    <v-navigation-drawer
        persistent
        v-model="drawer"
        light
        enable-resize-watcher
        absolute
        dark
    >
      <v-list dense>
        <v-list-tile @click="">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Home</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar dark fixed>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>
        <nuxt-link to="/">Home</nuxt-link>
        <v-btn v-on:click="signout">SignOut</v-btn>
      </v-toolbar-title>
    </v-toolbar>
    <main>
      <v-container fluid>
        <nuxt/>
      </v-container>
    </main>
    <v-footer dark>
      <span class="white--text">© 2017</span>
    </v-footer>
  </v-app>

</template>

<script>
  // import env from 'config'
  // console.log('env:' + JSON.stringify(env))
  import firebaseApp from '~/firebaseApp'

  // https://nuxtjs.org/api/pages-middleware/
  // meta can be passed as in: vue-router - middleware: https://github.com/nuxt/nuxt.js/issues/1687
  export default {
    // middleware: 'authenticated',
    data () {
      return {
        clipped: false,
        drawer: true,
        fixed: false,
        items: [
          {to: '/', title: 'Welcome', icon: 'apps'},
          {to: '/inspire', title: 'Inspire', icon: 'bubble_chart'}
        ],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        title: 'Vuetify.js'
      }
    },
    created () {
      console.log('in created')
    },
    methods: {
      signout () {
        console.log('signing out')
        firebaseApp.auth().signOut()
          .then(function () {
            console.log('Signed Out')

            return fetch('/api/logout', {
              // Send the client cookies to the server
              credentials: 'same-origin',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            })
              .then((response) => {
                console.log('User session destroyed:' + response.status)
                this.$router.push('/auth/signin')
              })
          }.bind(this),
          function (error) {
            console.error('Sign Out Error', error)
          })
      }
    }
  }
</script>

