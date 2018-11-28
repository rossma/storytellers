<template>
  <v-container grid-list-xl>
    <v-layout v-if="user.uid">
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
                      v-show="!computedUser.photoUrl"
                      slot="activator"
                      class="indigo jbtn-file">
                      <v-icon dark>account_circle</v-icon>
                      <input
                        type="file"
                        @change="profileImageSelected">
                    </v-avatar>
                    <v-avatar
                      v-show="computedUser.photoUrl"
                      slot="activator"
                      class="jbtn-file">
                      <img
                        :src="formUser.photoUrl"
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
                      v-model="computedUser.email"
                      label="Email"
                      readonly
                      disabled />
                    <v-text-field
                      v-model="formUser.displayName"
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
import { mapActions } from 'vuex'
import { uploadProfileImage } from '~/api/service/image'

import firebaseApp from '~/firebase/app'
import StoriesPreviewList from '~/components/StoriesPreviewList'
import UserStateMixin from '~/mixins/UserStateMixin'

export default {
  mixins: [ UserStateMixin ],
  components: {
    StoriesPreviewList
  },
  layout: 'default-protected',
  data () {
    return {
      valid: true,
      nameRules: [
        (v) => !!v || 'Name is required'
      ],
      formUser: {
        photoUrl: '',
        displayName: ''
      },
      newProfileImageFile: null
    }
  },
  computed: {
    computedUser: {
      get: function () {
        return this.user.data
      },
      set: function (newValue) {
        this.initFormUser(newValue)
      }
    },
    previewAuthorFilter () {
      return {
        byAuthorUid: this.user.uid,
        userProfile: true
      }
    }
  },

  watch: {
    computedUser: function (newValue) {
      this.initFormUser(newValue)
    }
  },

  created: function () {
    console.log('in created, user:', JSON.stringify(this.user))
    this.computedUser = this.user.data
  },
  methods: {
    ...mapActions('user', [
      'updateUser'
    ]),
    initFormUser(formValue) {
      if (formValue) {
        this.formUser.photoUrl = formValue.photoUrl,
        this.formUser.displayName = formValue.displayName
      }
    },
    profileImageSelected (e) {
      if (e.target.files[0]) {
        console.log('profile image selected')
        this.newProfileImageFile = e.target.files[0]
        this.computedUser = {
          photoUrl: URL.createObjectURL(this.newProfileImageFile),
          displayName: this.formUser.displayName
        }
        // uploadProfileImage(file, metadata, this.user.uid).then((downloadUrl) => {
        //   this.computedUser = {
        //     photoUrl: downloadUrl,
        //     displayName: this.formUser.displayName
        //   }
        // }).catch((error) => {
        //   this.$toast.error(error.message)
        // })
      } else {
        this.$toast.error('No profile image selected')
      }
    },
    uploadProfileImage() {
      if (this.newProfileImageFile) {
        const metadata = {
          'contentType': this.newProfileImageFile.type
        }
        return uploadProfileImage(this.newProfileImageFile, metadata, this.user.uid).then((downloadUrl) => {
          this.newProfileImageFile = null
          return downloadUrl
        })
      } else {
        return Promise.resolve(null)
      }
    },
    submit () {
      if (this.$refs.form.validate()) {
        this.uploadProfileImage().then((downloadUrl) => {
          console.log('downloadUrl:', downloadUrl)

          const userPart = {
            photoUrl: downloadUrl ? downloadUrl : this.formUser.photoUrl,
            displayName: this.formUser.displayName
          }

          const payload = { user: this.user, userPart: userPart }
          this.updateUser(payload).then(() => {
            return firebaseApp.auth().currentUser.updateProfile(userPart)
          }).then(() => {
            this.$toast.success('Profile successfully updated')
          }).catch((error) => {
            this.$toast.error(error.message)
          })

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