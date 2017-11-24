<template>
  <v-app dark>
    <navigation-toolbar></navigation-toolbar>
    <v-content>
     <nuxt />
    </v-content>
  </v-app>
</template>

<script>
  import LayoutFooter from '~/components/layout/Footer'
  import NavigationToolbar from '~/components/layout/NavigationToolbar'

  export default {
    components: {
      NavigationToolbar,
      LayoutFooter
    },
    middleware: 'authenticated'
  }
</script>

