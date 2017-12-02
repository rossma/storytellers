<template>
  <v-app
    id="example-1"
    toolbar
    footer
    dark>
    <v-toolbar
      dark
      fixed>
      <v-toolbar-title class="home-title">
        <nuxt-link to="/">Storytellers</nuxt-link>
      </v-toolbar-title>
      <v-spacer />
    </v-toolbar>
    <main>
      <v-container fluid>
        <nuxt/>
      </v-container>
    </main>
    <page-footer />
  </v-app>
</template>

<script>
import PageFooter from '~/components/layout/PageFooter'

export default {
  components: {
    PageFooter
  }
}
</script>

<style>
.home-title a {
  text-decoration: none
}
</style>
