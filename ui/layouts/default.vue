<template>
  <v-app>
    <the-navigation-toolbar />
    <v-content>
      <nuxt />
    </v-content>
    <the-page-footer />
  </v-app>
</template>

<script>
import ThePageFooter from '~/components/ThePageFooter'
import TheNavigationToolbar from '~/components/TheNavigationToolbar'

export default {
  components: {
    TheNavigationToolbar,
    ThePageFooter
  }
}
</script>
