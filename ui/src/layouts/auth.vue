<template>
  <v-app dark>
    <v-toolbar
      dark
      fixed
      app>
      <v-toolbar-title class="home-title">
        <nuxt-link to="/">Storytellers</nuxt-link>
      </v-toolbar-title>
      <v-spacer />
    </v-toolbar>
    <v-content>
      <v-container
        fluid
        fill-height>
        <nuxt/>
      </v-container>
    </v-content>
    <page-footer />
  </v-app>
</template>

<script>
import PageFooter from '~/components/layout/PageFooter'

export default {
  components: {
    PageFooter
  },
  middleware: 'anonymous'
}
</script>

<style>
.home-title a {
  text-decoration: none
}
</style>
