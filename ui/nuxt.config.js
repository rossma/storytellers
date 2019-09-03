import webpack from 'webpack'
import colors from 'vuetify/es5/util/colors'
// const webpack = require('webpack')

// const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
// const pkg = require('./package')

// const bodyParser = require('body-parser')
// const session = require('express-session')

require('dotenv').config()

const serviceAccount =
  process.env.NODE_ENV === 'production'
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG)
    : require('./firebase/service-account-credentials.json')

module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
  ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: ['~/assets/style/app.scss'],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [{ ssr: false, src: '~/plugins/vue-quill-editor.client.js' }],

  /*
  ** Nuxt.js dev-modules
  */
  devModules: ['@nuxtjs/vuetify'],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    [
      '@nuxtjs/axios',
      {
        // https: process.env.NODE_ENV === 'production',
        prefix: '/api',
        debug: true
      }
    ],
    ['@nuxtjs/dotenv'],
    '@nuxtjs/pwa',
    // https://github.com/nuxt-community/modules/tree/master/packages/toast
    '@nuxtjs/toast',
    'portal-vue/nuxt'
  ],
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/style/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.pink.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          tertiary: colors.indigo.darken3,
          negative: colors.deepOrange.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      },
      options: {
        customProperties: true
      }
    }
  },
  /*
  ** Axios module configuration
  */
  // axios: {
  //   // See https://github.com/nuxt-community/axios-module#option
  //   prefix: '/api',
  //   debug: true
  // },

  toast: {
    duration: '5000',
    position: 'top-center'
  },

  router: {
    middleware: ['check-auth']
  },

  // serverMiddleware: [
  //   // body-parser middleware
  //   bodyParser.json(),
  //   // session middleware
  //   session({
  //     secret: 'super-secret-key',
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: { maxAge: 60000 }
  //   })
  // ],

  /*
  ** Build configuration
  */
  build: {
    // transpile: ['vuetify/lib'],
    plugins: [
      // new VuetifyLoaderPlugin(),
      new webpack.ProvidePlugin({
        'window.Quill': 'quill/dist/quill.js',
        Quill: 'quill/dist/quill.js'
      })
    ],
    loaders: {
      // stylus: {
      //   import: ['~assets/style/variables.styl']
      // }
    },
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
          options: {
            fix: true
          }
        })
      }
      if (ctx.isClient) {
        console.log('is client ')
      }
      config.resolve.alias['fire/app'] = `~/firebase/${
        ctx.isClient ? 'app' : 'admin'
      }.js`

      /*
        for now to get pdf container to upload we set this to windows global ref
        https://github.com/webpack/webpack/issues/6642
      */
      config.output.globalObject = 'this'

      config.resolve.alias.vue = 'vue/dist/vue.common'
    }
  },
  env: {
    FIREBASE_CLIENT_API_KEY: process.env.FIREBASE_CLIENT_API_KEY,
    FIREBASE_CLIENT_MESSAGING_SENDER_ID:
      process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
    FIREBASE_CLIENT_PROJECT_ID: process.env.FIREBASE_CLIENT_PROJECT_ID,
    FIREBASE_SERVICE_ACCOUNT_CONFIG: serviceAccount
  }
}
