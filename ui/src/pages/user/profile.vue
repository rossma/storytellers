<template>
  <v-container grid-list-xl>
    <v-layout>
      <v-flex xs12>
        <v-expansion-panel>
          <v-expansion-panel-content>
            <div slot="header">
              <h2>User Profile</h2>
            </div>
            <v-layout
              row
              wrap
              text-xs-center>
              <v-flex xs2>
                <v-card
                  dark
                  flat>
                  <v-tooltip top>
                    <v-avatar
                      v-show="!photoUrl"
                      slot="activator"
                      class="indigo jbtn-file">
                      <v-icon dark>account_circle</v-icon>
                      <input
                        type="file"
                        @change="profileImageSelected">
                    </v-avatar>
                    <v-avatar
                      v-show="photoUrl"
                      slot="activator"
                      class="jbtn-file">
                      <img
                        :src="photoUrl"
                        alt="no photo">
                      <input
                        type="file"
                        @change="profileImageSelected">
                    </v-avatar>
                    <span>Upload Profile</span>
                  </v-tooltip>
                </v-card>
              </v-flex>
              <v-flex xs10>
                <v-card flat>
                  <v-form
                    ref="form"
                    v-model="valid"
                    lazy-validation>
                    <v-text-field
                      v-model="user.data.email"
                      label="Email"
                      readonly
                      disabled />
                    <v-text-field
                      v-model="user.data.displayName"
                      :rules="nameRules"
                      label="Display Name"
                      required />
                  </v-form>
                </v-card>
              </v-flex>
              <v-flex
                xs12
                text-xs-right>
                <v-btn
                  :disabled="!valid"
                  @click="submit">submit</v-btn>
              </v-flex>
            </v-layout>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-flex>
    </v-layout>
    <v-layout
      row
      wrap>
      <v-flex xs12>
        <v-card dark>
          <v-card-title primary><h2>My Stories</h2></v-card-title>
          <stories-preview-list
            :show-action="false"
            :filter-by="previewAuthorFilter" />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { uploadProfileImage } from '~/api/service/image'

import firebaseApp from '~/firebase/app'
import StoriesPreviewList from '~/components/StoriesPreviewList'

export default {
  components: {
    StoriesPreviewList
  },
  data () {
    return {
      valid: true,
      photoUrl: null,
      nameRules: [
        (v) => !!v || 'Name is required'
      ],
      previewAuthorFilter: {
        byAuthorUid: null,
        userProfile: true
      }
    }
  },
  computed: {
    ...mapGetters('modules/user', [
      'user'
    ])
  },
  created: function () {
    this.photoUrl = this.user.data.photoUrl
    this.previewAuthorFilter.byAuthorUid = this.user.uid
  },
  methods: {
    ...mapActions('modules/user', [
      'updateUser'
    ]),
    profileImageSelected (e) {
      if (e.target.files[0]) {
        console.log('profile image selected')
        let file = e.target.files[0]
        const metadata = {
          'contentType': file.type
        }
        uploadProfileImage(file, metadata, this.user.uid).then((downloadUrl) => {
          this.photoUrl = downloadUrl
        }).catch((error) => {
          this.$toast.error(error.message)
        })
      } else {
        this.$toast.error('No profile image selected')
      }
    },
    submit () {
      if (this.$refs.form.validate()) {
        this.user.data.photoUrl = this.photoUrl

        const userPart = {
          displayName: this.user.data.displayName,
          photoUrl: this.user.data.photoUrl
        }

        this.updateUser(this.user, userPart).then(() => {
          return firebaseApp.auth().currentUser.updateProfile(userPart)
        }).then(() => {
          this.$toast.success('Profile successfully updated')
        }).catch((error) => {
          this.$toast.error(error.message)
        })
      }
    }
  }
}
</script>

<style scoped>
.jbtn-file {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.jbtn-file input[type=file] {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 100%;
  min-height: 100%;
  font-size: 100px;
  text-align: right;
  filter: alpha(opacity=0);
  opacity: 0;
  outline: none;
  cursor: inherit;
  display: block;
}
</style>
