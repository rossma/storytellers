<template>
  <v-app id="example-1" toolbar footer dark>
    <v-toolbar dark fixed>
      <v-toolbar-title class="home-title">
        <nuxt-link to="/">Storytellers</nuxt-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <main>
      <v-container fluid>
        <nuxt/>
      </v-container>
    </main>
    <v-footer dark>
      <span class="white--text">© 2017</span>
    </v-footer>
  </v-app>
</template>

<style>
  .home-title a {
    text-decoration: none
  }
</style>
