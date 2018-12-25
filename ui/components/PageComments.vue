<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" width="600px">
      <v-card>
        <v-toolbar color="pink" dark>
          <v-toolbar-title>Comments</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="closeDialog()">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <page-comments-item
            v-for="(item, index) in mutableComments"
            :key="index"
            :comment="item"
            :index="index"
            :uid="uid"
            @like="likeComment"/>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex>
                <v-textarea
                  v-model="comment"
                  auto-grow
                  box
                  color="pink"
                  label="Comment"
                  rows="1" />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            flat
            @click="addComment">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
  import clonedeep from 'lodash.clonedeep'
  import PageCommentsItem from './PageCommentsItem'
  import { updatePage } from '~/api/service/page'

  export default {
    name: 'PageComments',
    components: {
      PageCommentsItem
    },
    props: {
      comments: {
        type: Array,
        default: () => {
          return []
        }
      },
      dialog: {
        type: Boolean,
        default: false
      },
      pageId: {
        type: String,
        required: true
      },
      uid: {
        type: String,
        required: true
      },
      userDisplayName: {
        type: String,
        required: true
      }
    },
    data () {
      return {
        comment: undefined,
        commentDialog: false,
        mutableComments: [],
        form: false
      }
    },
    computed: {
    },
    created: function () {
      this.mutableComments = clonedeep(this.comments)
    },
    methods: {
      addComment () {
        if (this.comment) {
          console.log('adding comment:', this.comment)
          this.mutableComments.push({
            comment: this.comment,
            uid: this.uid,
            userDisplayName: this.userDisplayName
          })
          updatePage( this.pageId, { comments: clonedeep(this.mutableComments) } ).then(() => {
            this.comment = undefined
            this.$emit('increment', this.mutableComments)
          }).catch((err) => {
            console.log('Error adding comment', err)
            this.$toast.error(`Error adding comment`)
          })
        }
      },
      closeDialog () {
        this.$emit('close', false)
      },
      likeComment ({index, liked}) {
        console.log('in likeComment', index, liked)
        if (index < this.mutableComments.length ) {

          let likes = this.mutableComments[index].likes || []
          if (liked && !likes.includes(this.uid)) {
            this.mutableComments[index].likes = likes.concat([this.uid])
          } else {
            this.mutableComments[index].likes = likes.filter(item => item !== this.uid)
          }

          updatePage( this.pageId, { comments: clonedeep(this.mutableComments) } )
        }
      }
    }
  }
</script>

<style>

</style>
