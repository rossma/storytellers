<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
      disable-route-watcher
    >
      <div class="ml-4 mt-2 mb-2">
        <v-tooltip bottom>
          <template #activator="{ on }">
            <nuxt-link to="/">
              <span v-on="on">
                <v-icon>mdi-home</v-icon>
                <span class="pl-4 home hidden-sm-and-down">Home</span>
              </span>
            </nuxt-link>
          </template>
          <span>Home</span>
        </v-tooltip>
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
        <v-icon>
          mdi-account-circle
        </v-icon>
      </v-avatar>
      <v-list>
        <v-list-group
          :prepend-icon="'mdi-account-circle'"
          no-action
          class="nav-account"
        >
          <template #activator>
            <v-list-item-title>{{ username }}</v-list-item-title>
          </template>

          <v-list-item
            to="/user/profile"
            @click="updateSidebar({ visible: false })"
          >
            <v-list-item-content>
              <v-list-item-title>Account</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-icon>mdi-account-circle</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-list-item @click="signout">
            <v-list-item-content>
              <v-list-item-title>Log out</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list-group>
      </v-list>
      <slot name="nav-drawer" />
    </v-navigation-drawer>
    <v-app-bar
      app
      fixed
    >
      <v-app-bar-nav-icon
        @click.stop="drawer = !drawer"
      />
      <v-toolbar-title class="home-title hidden-sm-and-down">
        <nuxt-link to="/">
          Storytellers
        </nuxt-link>
      </v-toolbar-title>
      <v-spacer />
      <v-layout
        align-center
        class="pr-2 search"
      >
        <v-text-field
          v-model="query"
          label="Search..."
          append-icon="mdi-magnify"
          color="primary"
          hide-details
          @click:append="search"
          @keyup.enter="search"
        />
      </v-layout>
      <v-tooltip float-left>
        <template #activator="{ on }">
          <v-btn
            fab
            small
            color="primary"
            to="/story/create"
            v-on="on"
          >
            <v-icon>mdi-feather</v-icon>
          </v-btn>
        </template>
        <span>Create Story</span>
      </v-tooltip>
    </v-app-bar>
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

.nav-account.primary--text {
  color: white !important;
  /*color: var(--v-accent-lighten2) !important;*/
  /*color: var(--v-primary-base);*/
}
</style>
