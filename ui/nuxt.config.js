module.exports = {
  srcDir: 'src/',
  /*
  ** Headers of the page
  */
  head: {
    title: 'Storytellers',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'StoryTellers Community Website' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  plugins: [
    '~/plugins/vuetify'
  ],
  css: [
    '~/assets/style/app.styl'
  ],
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    vendor: [
      'vuetify'
    ],
    extractCSS: true,
    /*
    ** Run ESLINT on save
    */
    extend(config, ctx) {
      if (ctx.dev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        })
      }
      if (ctx.dev) {
        config.resolve.alias['config'] = '~/config/development'
      } else {
        config.resolve.alias['config'] = '~/config/production'

        /* https://github.com/nuxt/nuxt.js/issues/1668
        *  https://github.com/nuxt/nuxt.js/issues/385*/
        /*const UglifyJSWebpackPlugin = require('uglifyjs-webpack-plugin')
        config.plugins = config.plugins.filter((plugin) => plugin.constructor.name !== 'UglifyJsPlugin')
        config.plugins.push(new UglifyJSWebpackPlugin())*/
      }
    }
  },
  modules: [
    '~/modules/material-design-icons',
    '@nuxtjs/toast'
  ]
  /*,
  *router: {
  *  middleware: 'check-auth'
  *}
  */
}
