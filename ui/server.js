// https://nuxtjs.org/examples/auth-routes

const { Nuxt, Builder } = require('nuxt')
const bodyParser = require('body-parser')
const session = require('express-session')
const app = require('express')()

// Body parser, to access req.body
app.use(bodyParser.json())

// Sessions to create req.session
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}))

// POST /api/login to add user to the session
// user onAuthStateChanged is handled in the check-auth.js script
app.post('/api/login', function (req, res) {
  console.log('[SERVER.JS] - in server.js api/login:' + JSON.stringify(req.body.user))
  // set the firebase user in session. Maybe don't need to set the whole thing.
  req.session.user = req.body.user
  return res.json({status: 'success'})
})

app.post('/api/logout', function (req, res) {
  console.log('[SERVER.JS] - in server.js api/logout')
  req.session.destroy()
  return res.json({status: 'success'})
})

const isProd = process.env.NODE_ENV === 'production'

// either initialise Nuxt.js with options:
// const nuxt = new Nuxt({ dev: !isProd })
// or with config file:
// https://nuxtjs.org/api/configuration-dev/
let config = require('./nuxt.config.js')
const nuxt = new Nuxt(config)

// No build in production
if (!isProd) {
  const builder = new Builder(nuxt)
  builder.build()
}
app.use(nuxt.render)
app.listen(3000)
console.log('Server is listening on http://localhost:3000')
