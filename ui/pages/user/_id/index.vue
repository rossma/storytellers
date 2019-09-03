<template>
  <v-container grid-list-xl>
    <v-layout>
      <v-flex xs12>
        <h2 class="pb-4">User Profile</h2>
        <v-card
          flat
        >
          <v-layout
            wrap
          >
            <v-flex xs1 mt-1 ml-4>
              <v-avatar
                v-show="!profileUser.photoUrl"
                class="pink jbtn-file"
                size="48"
              >
                <v-icon>
                  mdi-account-circle
                </v-icon>
              </v-avatar>
              <v-avatar
                v-show="profileUser.photoUrl"
                size="70"
              >
                <img
                  :src="profileUser.photoUrl"
                  alt="no photo"
                >
              </v-avatar>
            </v-flex>
            <v-flex xs10 mt-1 ml-4>
              <h3 class="headline mb-0">
                {{ profileUser.displayName }}
              </h3>
              <div>{{ profileUser.bio }}</div>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout wrap justify-center>
      <v-flex xs12>
        <v-toolbar color="info">
          <v-icon
            large
            float-left
            class="btn-look"
          >
            mdi-account-outline
          </v-icon>
          <v-toolbar-title>{{ profileUser.displayName }}'s Published Pages</v-toolbar-title>
        </v-toolbar>
        <v-card>
          <stories-preview-list
            :filter-by="previewAuthorFilter"
            :is-public-user-profile="true"
          />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { findUserByOid } from '~/api/service/user'
import StoriesPreviewList from '~/components/StoriesPreviewList'
import debug from 'debug'
const log = debug('app:pages/user/_id/index')

export default {
  name: 'UserProfile',
  components: {
    StoriesPreviewList
  },
  layout: 'default-protected',
  data() {
    return {
      profileUser: {
        bio: '',
        displayName: '',
        photoUrl: ''
      }
    }
  },
  computed: {
    previewAuthorFilter() {
      return {
        byAuthorUid: this.$route.params.id
      }
    }
  },
  mounted: function() {
    this.$nextTick(() => {
      log('in mounted, uid:', this.$route.params.id)
      this.loadPage(this.$route.params.id)
    })
  },
  methods: {
    loadPage(uid) {
      findUserByOid(uid).then(userDoc => {
        if (userDoc.exists) {
          this.profileUser = userDoc.data()
        } else {
          this.$toast.error('User profile does not exist')
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
