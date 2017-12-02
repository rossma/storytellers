<template>
  <v-app dark>
    <navigation-toolbar />
    <v-content>
      <nuxt />
    </v-content>
    <page-footer />
  </v-app>
</template>

<script>
import PageFooter from '~/components/layout/PageFooter'
import NavigationToolbar from '~/components/layout/NavigationToolbar'

export default {
  components: {
    NavigationToolbar,
    PageFooter
  },
  middleware: 'authenticated'
}
</script>
