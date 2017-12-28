<!-- Taken from https://github.com/jannhama/vuetify-upload-btn
    This uses invalid HTML input inside a button
    For now it will do but hope to replace with vuetify component when released
 -->
<template>
  <v-btn
    flat
    color="white"
    class="jbtn-file">
    <v-icon left>{{ icon }}</v-icon>
    {{ name }}
    <input
      id="selectFile"
      type="file"
      @change="fileSelected">
  </v-btn>
</template>

<script>
export default {
  props: {
    selectedCallback: {
      type: Function,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    }
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
