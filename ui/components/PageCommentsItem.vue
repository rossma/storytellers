<template>
  <div>
    <v-list-item
      :key="index"
      ripple
      class="comment-pamel"
    >
      <v-list-item-content>
        <v-list-item-title class="comment-title">
          {{ comment.userDisplayName }}
        </v-list-item-title>
        <v-list-item-subtitle>{{ comment.comment }}</v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn
          icon
          @click="like()"
        >
          <v-icon
            :color="liked ? 'red' : 'grey lighten-1'"
            small
          >
            mdi-heart
          </v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-divider />
  </div>
</template>
<script>
export default {
  name: 'PageCommentsItem',
  components: {},
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
  data() {
    return {
      liked: false
    }
  },
  computed: {},
  created: function() {
    if (this.comment.likes && this.comment.likes.includes(this.uid)) {
      this.liked = true
    }
  },
  methods: {
    like() {
      this.liked = !this.liked
      this.$emit('like', { index: this.index, liked: this.liked })
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
