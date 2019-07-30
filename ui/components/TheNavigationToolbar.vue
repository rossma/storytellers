<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
      disable-route-watcher
      dark
    >
      <div class="ml-3 mt-2 mb-2">
        <nuxt-link to="/">
          <v-icon>home</v-icon>
            <span class="pl-4 home hidden-sm-and-down">Home</span>
        </nuxt-link>
      </div>
      <v-divider light />
      <v-avatar
        v-if="photoUrl"
      >
        <img
          :src="photoUrl"
          alt="no photo"
        >
      </v-avatar>
      <v-avatar
        v-else
        color="primary"
      >
        <v-icon dark>
          account_circle
        </v-icon>
      </v-avatar>

      <v-list>
        <v-list-group
          :prepend-icon="'account_circle'"
          no-action
        >
          <template #activator>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>{{ username }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
          <v-list-tile
            to="/user/profile"
            @click="updateSidebar({ visible: false })"
          >
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
      fixed
    >
      <v-toolbar-side-icon
        @click.stop="drawer = !drawer"
      />
      <v-toolbar-title class="home-title hidden-sm-and-down">
        <nuxt-link to="/">
          Storytellers
        </nuxt-link>
      </v-toolbar-title>
      <v-spacer />
      <v-layout
        row 
        align-center
        class="pr-2 search"
      >
        <v-text-field
          v-model="query"
          label="Search..."
          append-icon="search"
          color="primary"
          hide-details
          @click:append="search"
          @keyup.enter="search"
        />
      </v-layout>
      <v-tooltip left>
        <template #activator="{ on }">
          <v-btn
            fab
            dark
            small
            v-on="on"
            color="pink darken-2"
            to="/story/create"
          >
            <v-icon>create</v-icon>
          </v-btn>
        </template>
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
  mixins: [UserStateMixin],
  data() {
    return {
      query: undefined
    }
  },
  computed: {
    ...mapGetters('common', ['sidebar']),
    // hasNavDrawerSlot () {
    //   return this.$slots['nav-drawer']
    // },
    drawer: {
      get() {
        return this.sidebar.visible
      },
      set(val) {
        this.updateSidebar({ visible: val })
      }
    },
    username() {
      if (this.user.data) {
        return this.user.data.displayName
          ? this.user.data.displayName
          : this.user.data.email
      } else {
        return ''
      }
    },
    photoUrl() {
      if (this.user.data) {
        return this.user.data.photoUrl
      } else {
        return ''
      }
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      if (!this.query && this.$route.params.query) {
        this.query = this.$route.params.query
      }
    })
  },
  methods: {
    ...mapActions('auth', ['logout']),
    ...mapActions('common', ['updateSidebar']),
    search() {
      log('in search', this.query)
      this.$router.push(`/search/${this.query}`)
    },
    signout() {
      this.logout()
        .then(() => {
          log('after logout')
          this.$router.push('/auth/signin')
        })
        .catch(error => {
          log('Error sign out:', error)
          this.$toast.error(error.message)
        })
    }
  }
}
</script>
<style scoped>
.v-speed-dial {
  margin-left: 10px;
}

.v-avatar {
  margin-top: 15px;
  margin-left: 15px;
}

.home {
  text-decoration: none;
  font-weight: bold;
  color: white;
}

.search {
}
</style>
