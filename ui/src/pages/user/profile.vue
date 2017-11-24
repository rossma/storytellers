<template>
  <v-container grid-list-xl>
    <v-alert :color="alert.colour" icon="check_circle" v-model="alert.show" dismissible>
      {{ alert.message }}
    </v-alert>
    <v-layout>
      <v-flex xs12>
        <v-card>
          <v-card-title primary class="title">User Profile</v-card-title>
          <v-layout row wrap text-xs-center>
            <v-flex xs2>
              <v-card dark flat>
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
              </v-card>
            </v-flex>
            <v-flex xs10>
              <v-card flat>
                <v-form v-model="valid" ref="form" lazy-validation>
                  <v-text-field label="Email" v-model="user.data.email" readonly disabled>
                  </v-text-field>
                  <v-text-field label="Display Name" v-model="user.data.displayName" required :rules="nameRules">
                  </v-text-field>
                </v-form>
              </v-card>
            </v-flex>
            <v-flex xs12 text-xs-right>
              <v-btn @click="submit" :disabled="!valid">submit</v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card dark>
          <v-card-title primary>My Stories</v-card-title>
          <preview-list name="PreviewList" v-bind:showAction="false" v-bind:filterBy="previewAuthorFilter"></preview-list>
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

  import firebaseApp from '~/firebaseApp'
  import PreviewList from '~/components/preview/PreviewList'

  const db = firebaseApp.firestore()

  export default {
    computed: {
      ...mapGetters([
        'user'
      ])
    },
    components: {
      PreviewList
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
        ],
        previewAuthorFilter: {
          byAuthorUid: null,
          userProfile: true
        }
      }
    },
    created: function () {
      this.photoUrl = this.user.photoUrl
      this.previewAuthorFilter.byAuthorUid = this.user.uid
      this.tmp()
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
      tmp () {
        console.log('in tmp method')
      },
      submit () {
        console.log('in submit')
        if (this.$refs.form.validate()) {
          console.log('valid')
          let firebaseUser = firebaseApp.auth().currentUser
          firebaseUser.updateProfile({
            displayName: this.user.data.displayName,
            photoURL: this.photoUrl
          }).then(function () {
            db.collection('users').doc(firebaseUser.uid).set({
              displayName: this.user.data.displayName,
              photoUrl: this.photoUrl
            }, { merge: true }).then(function () {
              this.user.data.photoUrl = this.photoUrl
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
      },
      showDetail (previewOid) {
        console.log('previewOid:', previewOid)
        this.$router.push('/story/detail/' + previewOid)
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