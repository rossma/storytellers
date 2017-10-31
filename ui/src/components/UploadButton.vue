<!-- Taken from https://github.com/jannhama/vuetify-upload-btn -->
<template>
  <v-tooltip top>
    <v-btn flat icon slot="activator" color="white" class="btn--dark-flat-focused jbtn-file">
      <v-icon>{{ icon }}</v-icon>
      <input id="selectFile" type="file" v-on:change="fileSelected">
    </v-btn>
    <span>{{ tooltip }}</span>
  </v-tooltip>
</template>

<script>
  export default {
    name: 'upload-button',
    props: {
      selectedCallback: Function,
      tooltip: String,
      icon: String
    },
    methods: {
      fileSelected (e) {
        if (this.selectedCallback) {
          if (e.target.files[0]) {
            this.selectedCallback(e.target.files[0])
          } else {
            this.selectedCallback(null)
          }
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