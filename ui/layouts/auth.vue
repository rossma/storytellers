<template>
  <v-app dark>
    <v-toolbar
      dark
      fixed
      app
    >
      <v-toolbar-title class="home-title">
        <nuxt-link to="/">
          Storytellers
        </nuxt-link>
      </v-toolbar-title>
      <v-spacer />
    </v-toolbar>
    <v-content>
      <v-container
        fluid
        fill-height
      >
        <nuxt />
      </v-container>
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
