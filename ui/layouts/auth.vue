<template>
  <v-app dark>
    <v-app-bar
      fixed
      app
    >
      <v-toolbar-title class="home-title">
        <nuxt-link to="/">
          Storytellers
        </nuxt-link>
      </v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    <v-content>
      <nuxt />
    </v-content>
    <the-page-footer />
  </v-app>
</template>

<script>
import ThePageFooter from '~/components/ThePageFooter'

export default {
  components: {
    ThePageFooter
  },
  middleware: 'anonymous'
}
</script>
<style>
.auth-container {
  max-width: 300px!important;
}
</style>
