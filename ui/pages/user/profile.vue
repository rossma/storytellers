<template>
  <v-container grid-list-xl>
    <v-layout v-if="user.uid">
      <v-flex xs12>
        <v-expansion-panels
          v-model="panel"
          multiple
        >
          <v-expansion-panel>
            <v-expansion-panel-header>
              <v-col
                class="expansion-header-icon">
                <v-icon
                  large
                  float-left
                >
                  mdi-face-profile
                </v-icon>
              </v-col>
              <v-col><h2>User Profile</h2></v-col>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-layout
                wrap
                text-center
              >
                <v-flex xs2>
                  <v-card
                    flat
                  >
                    <v-tooltip top>
                      <template #activator="{ on }">
                        <v-avatar
                          v-show="!formUser.photoUrl"
                          class="pink jbtn-file"
                          v-on="on"
                          :size="avatarSize"
                        >
                          <v-icon>
                            mdi-account-circle
                          </v-icon>
                          <input
                            type="file"
                            accept="image/*"
                            @change="profileImageSelected"
                          >
                        </v-avatar>
                        <v-avatar
                          v-show="formUser.photoUrl"
                          class="jbtn-file"
                          v-on="on"
                          :size="avatarSize"
                        >
                          <img
                            :src="formUser.photoUrl"
                            alt="no photo"
                          >
                          <input
                            type="file"
                            accept="image/*"
                            @change="profileImageSelected"
                          >
                        </v-avatar>
                      </template>
                      <span>Upload Profile</span>
                    </v-tooltip>
                  </v-card>
                </v-flex>
                <v-flex xs10>
                  <v-card flat>
                    <v-form
                      ref="form"
                      v-model="valid"
                      lazy-validation
                    >
                      <v-text-field
                        v-model="computedUser.email"
                        label="Email"
                        readonly
                        disabled
                      />
                      <v-text-field
                        v-model="formUser.displayName"
                        :rules="nameRules"
                        label="Display Name"
                        required
                      />
                      <v-text-field
                        v-model="formUser.bio"
                        label="Bio"
                      />
                    </v-form>
                  </v-card>
                </v-flex>
                <v-flex
                  xs12
                  text-right
                >
                  <v-btn
                    :disabled="!valid"
                    color="primary"
                    @click="submit"
                  >
                    <v-icon float-left>
                      mdi-check
                    </v-icon>submit
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
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
            mdi-account-box-outline
          </v-icon>
          <v-toolbar-title>My Stories</v-toolbar-title>
        </v-toolbar>
        <v-card>
          <stories-preview-list
            :filter-by="previewAuthorFilter"
            :is-private-user-profile="true"
          />
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { uploadProfileImage } from '~/api/service/image'

import clonedeep from 'lodash.clonedeep'
import firebaseApp from 'fire/app'
import StoriesPreviewList from '~/components/StoriesPreviewList'
import UserStateMixin from '~/mixins/UserStateMixin'
import debug from 'debug'

const log = debug('app:pages/user/profile')

export default {
  components: {
    StoriesPreviewList
  },
  mixins: [UserStateMixin],
  layout: 'default-protected',
  data() {
    return {
      panel: [0],
      valid: true,
      nameRules: [v => !!v || 'Name is required'],
      formUser: {
        photoUrl: '',
        displayName: '',
        bio: ''
      },
      newProfileImageFile: null
    }
  },
  computed: {
    avatarSize() {
      if (
        this.$vuetify.breakpoint.name === 'xs' ||
        this.$vuetify.breakpoint.name === 'sm'
      ) {
        return '48'
      } else {
        return '62'
      }
    },
    computedUser: {
      get: function() {
        return this.user.data
      },
      set: function(newValue) {
        this.initFormUser(newValue)
      }
    },
    previewAuthorFilter() {
      return {
        byAuthorUid: this.user.uid
      }
    }
  },
  watch: {
    computedUser: function(newValue) {
      this.initFormUser(newValue)
    }
  },
  created: function() {
    log('in created, user:', JSON.stringify(this.user))
    this.computedUser = this.user.data
  },
  methods: {
    ...mapActions('user', ['updateUser']),
    initFormUser(formValue) {
      if (formValue) {
        this.formUser.photoUrl = formValue.photoUrl
        this.formUser.displayName = formValue.displayName
        this.formUser.bio = formValue.bio
      }
    },
    profileImageSelected(e) {
      const imageFile = e.target.files[0]
      const limit = 1000000
      if (imageFile) {
        if (imageFile.size > limit) {
          this.$toast.error(
            `The file is over the ${limit / 1000 / 1000}MB limit`
          )
        } else if (!imageFile.type.startsWith('image/')) {
          this.$toast.error(`Please upload a valid image`)
        } else {
          this.newProfileImageFile = e.target.files[0]
          this.computedUser = {
            photoUrl: URL.createObjectURL(this.newProfileImageFile),
            displayName: this.formUser.displayName,
            bio: this.formUser.bio
          }
        }
      } else {
        this.$toast.error('No profile selected')
      }
    },
    uploadProfile() {
      if (this.newProfileImageFile) {
        return uploadProfileImage(this.newProfileImageFile, this.user.uid).then(
          downloadUrl => {
            this.newProfileImageFile = null
            return downloadUrl
          }
        )
      } else {
        return Promise.resolve(this.formUser.photoUrl || '')
      }
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.uploadProfile().then(downloadUrl => {
          log('downloadUrl:', downloadUrl)

          const userPart = {
            photoUrl: downloadUrl,
            displayName: this.formUser.displayName,
            bio: this.formUser.bio || ''
          }

          const payload = { user: clonedeep(this.user), userPart: userPart }
          this.updateUser(payload)
            .then(() => {
              return firebaseApp.auth().currentUser.updateProfile(userPart)
            })
            .then(() => {
              this.$toast.success('Profile successfully updated')
            })
            .catch(error => {
              this.$toast.error(error.message)
            })
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
