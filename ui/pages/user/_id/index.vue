<template>
  <v-container grid-list-xl>
    <v-layout>
      <v-flex xs12>
        <div slot="header">
          <h2>User Profile</h2>
        </div>
        <v-card
          dark
          flat>
          <v-card-title primary-title>
            <v-layout row wrap>
              <v-flex xs1>
                <v-avatar
                  v-show="!profileUser.photoUrl"
                  class="indigo jbtn-file"
                  size="70">
                  <v-icon dark>account_circle</v-icon>
                </v-avatar>
                <v-avatar
                  v-show="profileUser.photoUrl"
                  size="70">
                  <img
                    :src="profileUser.photoUrl"
                    alt="no photo">
                </v-avatar>
              </v-flex>
              <v-flex xs11>
                <h3 class="headline mb-0">{{ profileUser.displayName }}</h3>
                <div>{{ profileUser.bio }}</div>
              </v-flex>
            </v-layout>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout
      row
      wrap>
      <v-flex xs12>
        <v-card dark>
          <v-card-title primary><h2>User Published Pages</h2></v-card-title>
          <stories-preview-list
            :filter-by="previewAuthorFilter"
            :is-public-user-profile="true" />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { findUserByOid } from '~/api/service/user'
  import StoriesPreviewList from '~/components/StoriesPreviewList'

  export default {
    name: 'UserProfile',
    components: {
      StoriesPreviewList
    },
    layout: 'default-protected',
    data () {
      return {
        profileUser: {
          bio: '',
          displayName: '',
          photoUrl: ''
        }
      }
    },
    computed: {
      previewAuthorFilter () {
        return {
          byAuthorUid: this.$route.params.id
        }
      }
    },
    created: function () {
    },
    mounted: function () {
      this.$nextTick(() => {
        console.log('[User Profile] - in mounted, uid:', this.$route.params.id)
        this.loadPage(this.$route.params.id)
      })
    },
    methods: {
      loadPage (uid) {
        findUserByOid(uid).then((userDoc) => {
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
