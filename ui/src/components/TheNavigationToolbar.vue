<!--suppress ALL -->
<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      clipped
      app
      disable-route-watcher
      dark>
      <v-list dense>
        <slot name="nav-drawer" />
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      dark
      app
      clipped-left
      fixed>
      <v-toolbar-side-icon
        v-if="hasNavDrawerSlot"
        @click.stop="drawer = !drawer"/>
      <v-toolbar-title class="home-title">
        <nuxt-link to="/">Storytellers</nuxt-link>
      </v-toolbar-title>
      <v-spacer />
      <v-tooltip left>
        <v-btn
          slot="activator"
          fab
          dark
          small
          to="/story/create">
          <v-icon>mdi mdi-feather</v-icon>
        </v-btn>
        <span>Create Story</span>
      </v-tooltip>
      <v-speed-dial
        v-model="profile.fab"
        :bottom="profile.bottom"
        :direction="profile.direction"
        :hover="profile.hover"
        :transition="profile.transition">
        <v-tooltip left>
          <v-btn
            slot="activator"
            fab
            dark
            small
            @click="userProfile">
            <v-icon>mdi mdi-account-edit</v-icon>
          </v-btn>
          <span>User Profile</span>
        </v-tooltip>
        <v-tooltip left>
          <v-btn
            slot="activator"
            fab
            dark
            small
            @click="signout">
            <v-icon>mdi mdi-logout</v-icon>
          </v-btn>
          <span>SignOut</span>
        </v-tooltip>
      </v-speed-dial>
      <v-btn
        slot="activator"
        v-model="profile.fab"
        color="darken-2"
        dark
        fab
        small
        hover>
        <v-icon>account_circle</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'TheNavigationToolbar',
  data () {
    return {
      drawer: false,
      profile: {
        direction: 'bottom',
        fab: false,
        fling: false,
        hover: false,
        tabs: null,
        top: false,
        right: true,
        bottom: false,
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
  computed: {
    hasNavDrawerSlot () {
      return this.$slots['nav-drawer']
    }
  },
  methods: {
    ...mapActions('modules/user', [
      'logout'
    ]),
    userProfile () {
      this.$router.push('/user/profile')
    },
    signout () {
      this.logout().then(() => {
        console.log('after logout')
        this.$router.push('/auth/signin')
      }).catch((error) => {
        this.$toast.error(error.message)
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
