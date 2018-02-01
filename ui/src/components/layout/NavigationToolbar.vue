<!--suppress ALL -->
<template>
  <div>
    <v-navigation-drawer
      fixed
      clipped
      app
      v-model="drawer"
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
        @click.stop="drawer = !drawer"
        v-if="hasNavDrawerSlot" />
      <v-toolbar-title class="home-title">
        <nuxt-link to="/">Storytellers</nuxt-link>
      </v-toolbar-title>
      <v-spacer />
      <v-tooltip left>
        <v-btn
          fab
          dark
          small
          slot="activator"
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
        <v-btn
          slot="activator"
          color="darken-2"
          dark
          fab
          small
          hover
          v-model="profile.fab">
          <v-icon>account_circle</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
        <v-tooltip left>
          <v-btn
            fab
            dark
            small
            slot="activator"
            @click="userProfile">
            <v-icon>mdi mdi-account-edit</v-icon>
          </v-btn>
          <span>User Profile</span>
        </v-tooltip>
        <v-tooltip left>
          <v-btn
            fab
            dark
            small
            slot="activator"
            @click="signout">
            <v-icon>mdi mdi-logout</v-icon>
          </v-btn>
          <span>SignOut</span>
        </v-tooltip>
      </v-speed-dial>
    </v-toolbar>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'NavigationToolbar',
  props: {
    immutableDrawer: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      drawer: this.immutableDrawer,
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
    ...mapActions([
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
