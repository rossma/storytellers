import express from 'express'
// const express = require('express')

// const bodyParser = require('body-parser')
import bodyParser from 'body-parser'

// const consola = require('consola')
import consola from 'consola'

// const { Nuxt, Builder } = require('nuxt')
import { Nuxt, Builder } from 'nuxt'

const app = express()

const host = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT) || 3000

const session = require('express-session')

// Import and Set Nuxt.js options
const config = require('../nuxt.config.ts')
const auth = require('./auth')(app)
config.dev = !(process.env.NODE_ENV === 'production')

// Sessions to create `req.session`
app.use(
  session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
  })
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/api', auth)
app.set('port', port)

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)
  await nuxt.ready()

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host, () => {
    // tslint:disable-next-line:no-console
    consola.info(`server started at http://localhost:${port}`)
    // console.log( `server started at http://localhost:${ port }` );
  })

  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
