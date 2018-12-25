<template>
  <div>
    <v-list-tile
      :key="index"
      avatar
      ripple
      class="comment-pamel"
    >
      <v-list-tile-content>
        <v-list-tile-title class="comment-title">{{ comment.userDisplayName }}</v-list-tile-title>
        <v-list-tile-sub-title>{{ comment.comment }}</v-list-tile-sub-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-btn
          icon
          @click="like()">
          <v-icon
            small
            :color="liked ? 'red' : 'grey lighten-1'">favorite</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
    <v-divider />
    <!--<v-divider v-if="index + 1 < mutableComments.length" :key="`divider-${index}`"></v-divider>-->
  </div>
</template>
<script>
  // import { EventBus } from '~/utils/event-bus.js'

  export default {
    name: 'PageCommentsItem',
    components: {
    },
    props: {
      comment: {
        type: Object,
        required: true
      },
      index: {
        type: Number,
        required: true
      },
      uid: {
        type: String,
        required: true
      }
    },
    data () {
      return {
        liked: false
      }
    },
    computed: {
    },
    created: function () {
      if (this.comment.likes && this.comment.likes.includes(this.uid)) {
        this.liked = true
      }
    },
    methods: {
      like () {
        this.liked = !this.liked
        this.$emit('like', { index: this.index, liked: this.liked } )
      }
    }
  }
</script>

<style>
  .comment-pamel {
    padding-top: 5px;
    padding-bottom: 10px;
  }
  .comment-title {
    font-weight: bold;
  }
</style>
