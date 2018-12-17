<template>
  <v-app dark>
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
// import UserStateMixin from '~/mixins/UserStateMixin'

export default {
  components: {
    TheNavigationToolbar,
    ThePageFooter
  },
  // middleware: 'authenticated',
  // mixins: [ UserStateMixin ]
}
</script>
