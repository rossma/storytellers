<template>
  <v-container grid-list-xl>
    <v-alert :color="alert.colour" icon="check_circle" v-model="alert.show" dismissible>
      {{ alert.message }}
    </v-alert>
    <v-layout>
      <v-flex>
        <v-card>
          <v-card-title primary class="title">User Profile</v-card-title>
          <v-card-text>
            <v-form v-model="valid" ref="form" lazy-validation>
              <v-card color="secondary" flat>
                <v-card-text>
                  <v-container fluid>
                    <v-layout row>
                      <v-flex xs12>
                        <v-tooltip top>
                          <v-avatar class="indigo jbtn-file" v-show="!photoUrl" slot="activator">
                              <v-icon dark>account_circle</v-icon>
                              <input type="file" v-on:change="profileImageSelected">
                          </v-avatar>
                          <v-avatar class="jbtn-file" v-show="photoUrl" slot="activator">
                            <img :src="photoUrl" alt="no photo">
                            <input type="file" v-on:change="profileImageSelected">
                          </v-avatar>
                          <span>Upload Profile</span>
                        </v-tooltip>
                        <v-text-field label="Display Name" v-model="user.displayName" required
                                      :rules="nameRules"></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>
              </v-card>
              <v-btn @click="submit" :disabled="!valid">submit</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'

  import firebaseApp from '~/firebaseApp'

  const db = firebaseApp.firestore()

  export default {
    computed: {
      ...mapGetters([
        'user'
      ])
    },
    data () {
      return {
        alert: {
          show: false,
          message: '',
          colour: 'success'
        },
        valid: true,
        photoUrl: null,
        nameRules: [
          (v) => !!v || 'Name is required'
        ]
      }
    },
    mounted: function () {
      this.$nextTick(function () {
        this.photoUrl = this.user.photoUrl
      })
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
          var storageRef = firebaseApp.storage().ref()
          storageRef.child('images/' + file.name).put(file, metadata)
            .then(function (snapshot) {
              console.log('Uploaded', snapshot.totalBytes, 'bytes.')
              console.log('Metadata:', snapshot.metadata)
              console.log('downloadURL:', snapshot.downloadURL)
              this.photoUrl = snapshot.downloadURL
            }.bind(this)).catch(function (error) {
              console.error('Upload failed:', error)
            })
        } else {
          console.log('no profile image selected')
        }
      },
      submit () {
        console.log('in submit')
        if (this.$refs.form.validate()) {
          console.log('valid')
          let firebaseUser = firebaseApp.auth().currentUser
          firebaseUser.updateProfile({
            displayName: this.user.displayName,
            photoURL: this.photoUrl
          }).then(function () {
            db.collection('users').doc(firebaseUser.uid).set({
              displayName: this.user.displayName,
              photoUrl: this.photoUrl
            }, { merge: true }).then(function () {
              this.user.photoUrl = this.photoUrl
              console.log('user:', this.user)
              this.saveUser(this.user)
              this.raiseAlert('success', 'Profile successfully updated')
            }.bind(this)).catch(function (error) {
              console.error('Error adding user document', error)
              this.raiseAlert('error', 'There was an error updating your profile')
            })
          }.bind(this)).catch(function (error) {
            console.log('Error updating user profile', error)
            this.raiseAlert('error', 'There was an error updating your profile')
          }.bind(this))
        }
      },
      raiseAlert (severity, message) {
        this.alert.show = true
        this.alert.colour = severity
        this.alert.message = message
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