<template>
  <v-container grid-list-xl>
    <v-layout>
      <v-flex>
        <v-card>
          <v-card-title primary class="title">Create Story</v-card-title>
          <v-card-text>
            <v-form v-model="valid" ref="form" lazy-validation>
              <v-card color="secondary" flat>
                <v-card-text>
                  <v-container fluid>
                    <v-layout row>
                      <v-flex xs12>
                        <v-text-field label="Title" v-model="story.title" required></v-text-field>
                        <v-text-field name="summary" label="Summary" textarea v-model="story.summary" dark></v-text-field>
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
  import { mapActions } from 'vuex'

  import firebaseApp from '~/firebaseApp'
  const db = firebaseApp.firestore()

  export default {
    data () {
      return {
        valid: true,
        story: {
          id: null,
          title: '',
          summary: '',
          created: Date.now()
        }
      }
    },
    methods: {
      ...mapActions([
        'saveStory'
      ]),
      submit () {
        if (this.$refs.form.validate()) {
          console.log('submiting form:', this.story)
          db.collection('stories').add({
            uid: firebaseApp.auth().currentUser.uid,
            title: this.story.title,
            summary: this.story.summary,
            created: this.story.created
          })
            .then(function (docRef) {
              console.log('Document written with ID: ', docRef.id)
              this.story.id = docRef.id
              this.saveStory(this.story)
              this.$router.push('/story/update')
            }.bind(this))
            .catch(function (error) {
              console.error('Error adding document: ', error)
            })
        } else {
          console.log('Form validation failed')
        }
      }
    }
  }
</script>
