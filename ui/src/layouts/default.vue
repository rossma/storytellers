<!-- This template is very authenticated users only -->
<template>
  <v-app toolbar footer dark>
    <v-navigation-drawer persistent v-model="drawer" enable-resize-watcher absolute dark app>
      <v-list dense>
        <v-list-tile @click="home">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Storytellers</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="">
          <v-list-tile-action>
            <v-icon>contact_mail</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Contact</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class="home-title">
        <nuxt-link to="/">Storytellers</nuxt-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip left>
        <v-btn fab dark small slot="activator" to="/story/create">
          <v-icon>mdi mdi-feather</v-icon>
        </v-btn>
        <span>Create Story</span>
      </v-tooltip>
      <v-speed-dial v-model="profile.fab" :bottom="false" :direction="profile.direction" :hover="profile.hover"
                    :transition="profile.transition">
        <v-btn slot="activator" color="darken-2" dark fab small hover v-model="profile.fab">
          <v-icon>account_circle</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
        <v-tooltip left>
          <v-btn fab dark small slot="activator" v-on:click="userProfile">
            <v-icon>mdi mdi-account-edit</v-icon>
          </v-btn>
          <span>User Profile</span>
        </v-tooltip>
        <v-tooltip left>
          <v-btn fab dark small slot="activator" v-on:click="signout">
            <v-icon>mdi mdi-logout</v-icon>
          </v-btn>
          <span>SignOut</span>
        </v-tooltip>
      </v-speed-dial>
    </v-toolbar>
    <main>
      <v-content>
        <nuxt/>
      </v-content>
    </main>
    <v-footer dark>
      <span class="white--text">© 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
  import firebaseApp from '~/firebaseApp'

  export default {
    middleware: 'authenticated',
    data () {
      return {
        clipped: false,
        drawer: true,
        fixed: false,
        profile: {
          direction: 'bottom',
          fab: false,
          fling: false,
          hover: false,
          tabs: null,
          top: false,
          right: true,
          bottom: true,
          left: false,
          transition: 'slide-y-reverse-transition'
        },
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
    methods: {
      home () {
        this.$router.push('/')
      },
      userProfile () {
        this.$router.push('/user/profile')
      },
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
<style>
  .home-title a {
    text-decoration: none
  }
</style>
