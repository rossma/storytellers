<template>
  <v-app toolbar footer dark>
    <navigation-toolbar>
      <v-divider slot="nav-drawer" light></v-divider>
      <v-list slot="nav-drawer" dense>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Story name ... </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-divider slot="nav-drawer" light></v-divider>
      <v-list  slot="nav-drawer" dense class="grey darken-3">
        <template v-for="(chapter, i) in chapters">
          <v-layout row align-center>
            <v-flex xs6>
              <v-subheader>
                {{ chapter.name }}
              </v-subheader>
            </v-flex>
            <v-flex xs6 class="text-xs-right">
              <v-btn small flat>edit</v-btn>
            </v-flex>
          </v-layout>
          <v-list-tile v-for="(page, pidx) in chapter.pages" :key="page.name">
            <v-list-tile-action>
              x
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title class="grey--text">
                {{ page.name }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon>add</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title class="grey--text">
                Add page
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider slot="nav-drawer" light></v-divider>
        </template>
        <v-layout row align-center>
          <v-flex xs6>
            <v-icon>add</v-icon>
            Add chapter
          </v-flex>
        </v-layout>
      </v-list>
    </navigation-toolbar>
    <main>
      <v-content>
        <nuxt/>
      </v-content>
    </main>
    <layout-footer/>
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
    middleware: 'authenticated',
    data () {
      return {
        chapters: [
          { name: 'Chapter 1',
            pages: [
              { name: '1' },
              { name: '2' },
              { name: '3' },
              { name: '4' },
              { name: '5' },
              { name: '6' }
            ]
          },
          { name: 'Chapter 2',
            pages: [
              { name: '1' },
              { name: '2' },
              { name: '3' }
            ]
          },
          { name: 'Chapter 3',
            pages: [
              { name: '1' },
              { name: '2' }
            ]},
          { name: 'Chapter 4',
            pages: [
              { name: '1' },
              { name: '2' },
              { name: '3' },
              { name: '4' }
            ]
          }
        ]
      }
    }
  }
</script>

