import webpack from 'webpack'
// const webpack = require('webpack')

const pkg = require('./package')

// const bodyParser = require('body-parser')
// const session = require('express-session')

require('dotenv').config()

let serviceAccount =
  process.env.NODE_ENV === 'production'
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG || '')
    : require('./firebase/service-account-credentials.json')

module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui'
      },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: ['~/assets/style/app.styl'],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { ssr: false, src: '~/plugins/vue-quill-editor.client.js' },
    '~/plugins/vuetify'
  ],

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
    '@nuxtjs/toast'
  ],
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

      /* because in utils/constant referencing windows I need to set this, more here: https://github.com/webpack/webpack/issues/6642 */
      config.output.globalObject = 'this'

      config.resolve.alias["vue"] = "vue/dist/vue.common";
    },
    plugins: [
      new webpack.ProvidePlugin({
        'window.Quill': 'quill/dist/quill.js',
        Quill: 'quill/dist/quill.js'
      })
    ]
  },
  env: {
    FIREBASE_CLIENT_API_KEY: process.env.FIREBASE_CLIENT_API_KEY,
    FIREBASE_CLIENT_MESSAGING_SENDER_ID:
    process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
    FIREBASE_CLIENT_PROJECT_ID: process.env.FIREBASE_CLIENT_PROJECT_ID,
    FIREBASE_SERVICE_ACCOUNT_CONFIG: serviceAccount
  }
}
