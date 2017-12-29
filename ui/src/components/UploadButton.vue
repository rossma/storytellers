<template>
  <label class="btn btn--flat theme--dark custom-file-upload">
    <input
      id="selectFile"
      type="file"
      @change="fileSelected">
    <div class="btn__content">
      <v-icon left>{{ icon }}</v-icon>
      {{ name }}
    </div>
  </label>
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
    fileSelected (event) {
      if (this.selectedCallback) {
        if (event.target.files[0]) {
          this.selectedCallback(event.target.files[0])
        } else {
          this.selectedCallback(null)
        }
      }
      event.target.value = null
      return false
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

input[type="file"] {
  display: none;
}

.custom-file-upload {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
}
</style>
