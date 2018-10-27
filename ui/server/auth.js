const express = require('express')
const router = express.Router()

// Transform req & res to have the same API as express
// So we can use res.status() & res.json()
const app = express()

router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

// Add POST - /api/login
router.post('/login', (req, res) => {
  console.log('[API] - LOGIN POST', req.headers, req.body.user)
  req.session.user = req.body.user
  res.cookie('access_token',req.body.token, { maxAge: 900000, httpOnly: true })
  return res.json( { status: 'success' })
})

// Add POST - /api/logout
router.post('/logout', (req, res) => {
  console.log('[API] - LOGOUT POST')
  delete req.session.user
  res.clearCookie('access_token');
  return res.json({ status: 'success' })
})

module.exports = router
