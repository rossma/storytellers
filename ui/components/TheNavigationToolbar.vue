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
          color="indigo darken-2"
          to="/story/create">
          <v-icon>create</v-icon>
        </v-btn>
        <span>Create Story</span>
      </v-tooltip>
      <v-speed-dial
        v-model="profile.fab"
        :top="profile.top"
        :bottom="profile.bottom"
        :right="profile.right"
        :direction="profile.direction"
        :open-on-hover="profile.hover"
        :transition="profile.transition"
      >
        <v-btn
          slot="activator"
          v-model="profile.fab"
          color="blue darken-2"
          dark
          fab
          small
        >
          <v-icon>account_circle</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
        <v-tooltip left>
          <v-btn
            slot="activator"
            fab
            dark
            small
            color="green"
            @click="userProfile"
          >
            <v-icon>perm_identity</v-icon>
          </v-btn>
          <span>User Profile</span>
        </v-tooltip>
        <v-tooltip left>
          <v-btn
            slot="activator"
            fab
            dark
            small
            color="red"
            @click="signout"
          >
            <v-icon>exit_to_app</v-icon>
          </v-btn>
          <span>SignOut</span>
        </v-tooltip>
      </v-speed-dial>
      <!--<v-speed-dial-->
        <!--v-model="profile.fab"-->
        <!--:bottom="profile.bottom"-->
        <!--:direction="profile.direction"-->
        <!--:hover="profile.hover"-->
        <!--:transition="profile.transition">-->
        <!--<v-tooltip left>-->
          <!--<v-btn-->
            <!--slot="activator"-->
            <!--fab-->
            <!--dark-->
            <!--small-->
            <!--@click="userProfile">-->
            <!--<v-icon>mdi mdi-account-edit</v-icon>-->
          <!--</v-btn>-->
          <!--<span>User Profile</span>-->
        <!--</v-tooltip>-->
        <!--<v-tooltip left>-->
          <!--<v-btn-->
            <!--slot="activator"-->
            <!--fab-->
            <!--dark-->
            <!--small-->
            <!--@click="signout">-->
            <!--<v-icon>mdi mdi-logout</v-icon>-->
          <!--</v-btn>-->
          <!--<span>SignOut</span>-->
        <!--</v-tooltip>-->
      <!--</v-speed-dial>-->
      <!--<v-btn-->
        <!--slot="activator"-->
        <!--v-model="profile.fab"-->
        <!--color="darken-2"-->
        <!--dark-->
        <!--fab-->
        <!--small-->
        <!--hover>-->
        <!--<v-icon>account_circle</v-icon>-->
        <!--<v-icon>close</v-icon>-->
      <!--</v-btn>-->
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
        { to: '/', title: 'Welcome', icon: 'apps' },
        { to: '/inspire', title: 'Inspire', icon: 'bubble_chart' }
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
        console.log('Error sign out:', error)
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

.v-speed-dial {
  margin-left: 10px;
}
</style>
