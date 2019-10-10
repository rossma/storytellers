<template>
  <label class="v-btn v-btn--icon theme--dark custom-file-upload">
    <input
      id="selectFile"
      type="file"
      @change="fileSelected"
      :accept="acceptedFileTypes"
    >
    <div class="btn__content">
      <v-icon>{{ icon }}</v-icon>
      {{ name }}
    </div>
  </label>
</template>

<script>
export default {
  props: {
    acceptedFileTypes: {
      type: String,
      default: ''
    },
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
    fileSelected(event) {
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
input[type='file'] {
  display: none;
}

.custom-file-upload {
  /*display: inline-block;*/
  cursor: pointer;
  background-color: transparent!important;
}
</style>
