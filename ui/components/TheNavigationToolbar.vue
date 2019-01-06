<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
      disable-route-watcher
      dark>

      <v-divider
        slot="activator"
        light />
      <v-avatar
        v-if="photoUrl"
        class="avatar">
        <img
          :src="photoUrl"
          alt="no photo">
      </v-avatar>
      <v-avatar
        v-else
        class="indigo avatar">
        <v-icon dark>account_circle</v-icon>
      </v-avatar>

      <v-list>
        <v-list-group
          :prepend-icon="'account_circle'"
          no-action>
          <v-list-tile slot="activator">
            <v-list-tile-content>
              <v-list-tile-title>{{ username }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile
            @click="updateSidebar({ visible: false })"
            to="/user/profile">
            <v-list-tile-content>
              <v-list-tile-title>Account</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-icon>account_circle</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile @click="signout">
            <v-list-tile-content>
              <v-list-tile-title>Log out</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-icon>exit_to_app</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list-group>
      </v-list>
      <slot name="nav-drawer" />
    </v-navigation-drawer>
    <v-toolbar
      dark
      app
      fixed>
      <v-toolbar-side-icon
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
    </v-toolbar>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import UserStateMixin from '~/mixins/UserStateMixin'
import debug from 'debug'
const log = debug('app:components/TheNavigationToolbar')

export default {
  name: 'TheNavigationToolbar',
  mixins: [ UserStateMixin ],
  computed: {
    ...mapGetters('common', [
      'sidebar'
    ]),
    // hasNavDrawerSlot () {
    //   return this.$slots['nav-drawer']
    // },
    drawer: {
      get () {
        return this.sidebar.visible
      },
      set (val) {
        this.updateSidebar({ visible: val })
      }
    },
    username () {
      if (this.user.data) {
        return this.user.data.displayName ? this.user.data.displayName : this.user.data.email
      } else {
        return ''
      }
    },
    photoUrl () {
      if (this.user.data) {
        return this.user.data.photoUrl
      } else {
        return ''
      }
    }
  },
  methods: {
    ...mapActions('auth', [
      'logout'
    ]),
    ...mapActions('common', [
      'updateSidebar'
    ]),
    signout () {
      this.logout().then(() => {
        log('after logout')
        this.$router.push('/auth/signin')
      }).catch((error) => {
        log('Error sign out:', error)
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

a {
   color: white!important;
   /*font-weight: bold!important;*/
   text-decoration: none!important;
   text-transform: none!important;
 }

a:hover {
  text-decoration: none!important;
}

.avatar {
  margin-top: 15px;
  margin-left: 15px;
}

</style>
