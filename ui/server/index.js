const express = require('express')
var bodyParser = require('body-parser')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const auth = require('./auth')

const app = express()
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

const session = require('express-session')

// Sessions to create `req.session`
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/api', auth)
app.set('port', port)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)

  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()

