<template>
  <v-container grid-list-xl>
    <v-alert
      outline
      :color="alert.colour"
      :icon="alert.icon"
      v-model="alert.show"
      dismissible>
      {{ alert.message }}
    </v-alert>
    <v-layout>
      <v-flex xs12>
        <v-expansion-panel>
          <v-expansion-panel-content>
            <div slot="header">
              <h3>User Profile</h3>
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
                      class="indigo jbtn-file"
                      v-show="!photoUrl"
                      slot="activator">
                      <v-icon dark>account_circle</v-icon>
                      <input
                        type="file"
                        @change="profileImageSelected">
                    </v-avatar>
                    <v-avatar
                      class="jbtn-file"
                      v-show="photoUrl"
                      slot="activator">
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
                    v-model="valid"
                    ref="form"
                    lazy-validation>
                    <v-text-field
                      label="Email"
                      v-model="user.data.email"
                      readonly
                      disabled />
                    <v-text-field
                      label="Display Name"
                      v-model="user.data.displayName"
                      required
                      :rules="nameRules" />
                  </v-form>
                </v-card>
              </v-flex>
              <v-flex
                xs12
                text-xs-right>
                <v-btn
                  @click="submit"
                  :disabled="!valid">submit</v-btn>
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
          <v-card-title primary>My Stories</v-card-title>
          <preview-list
            name="PreviewList"
            :show-action="false"
            :filter-by="previewAuthorFilter" />
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card dark>
          <v-card-title primary>Collaborations</v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { uploadProfileImage } from '~/service/image'
import { updateUser } from '~/service/user'

import firebaseApp from '~/firebaseApp'
import PreviewList from '~/components/preview/PreviewList'
import alertUtil from '~/utils/alert'

export default {
  components: {
    PreviewList
  },
  data () {
    return {
      alert: {
        show: false
      },
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
    ...mapGetters([
      'user'
    ])
  },
  created: function () {
    this.photoUrl = this.user.photoUrl
    this.previewAuthorFilter.byAuthorUid = this.user.uid
  },
  methods: {
    ...mapActions([
      'saveUser'
    ]),
    profileImageSelected (e) {
      if (e.target.files[0]) {
        console.log('profile image selected')
        let file = e.target.files[0]
        var metadata = {
          'contentType': file.type
        }
        uploadProfileImage(file, metadata, this.user.uid).then((downloadUrl) => {
          this.photoUrl = downloadUrl
        }).catch((error) => {
          this.alert = alertUtil.raiseAlert('error', error.message)
        })
      } else {
        this.alert = alertUtil.raiseAlert('warning', 'no profile image selected')
      }
    },
    submit () {
      if (this.$refs.form.validate()) {
        let firebaseUser = firebaseApp.auth().currentUser
        firebaseUser.updateProfile({
          displayName: this.user.data.displayName,
          photoURL: this.photoUrl
        }).then(() => {
          return updateUser(firebaseUser.uid,
            {
              displayName: this.user.data.displayName,
              photoUrl: this.photoUrl
            })
        }).then(() => {
          this.user.data.photoUrl = this.photoUrl
          console.log('user:', this.user)
          this.saveUser(this.user)
          this.alert = alertUtil.raiseAlert('success', 'Profile successfully updated')
        }).catch((error) => {
          this.alert = alertUtil.raiseAlert('error', error.message)
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
