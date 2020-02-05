const express = require('express')
const router = express.Router({strict: true})

const ejs = require('ejs')
const path = require('path').resolve()
const fs = require('fs')
const os = require('os')
const slash = require('express-slash')

const config = require('../config')

router.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8')
  res.set('X-Robots-Tag', 'noindex')

  res.render('install/index', {config, fs, os, path})
})

router.use(slash())

router.post('/install_config/', (req, res) => {
  let datenow = new Date()

  let day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  let gmnow = `${day[datenow.getUTCDay()]}, ${datenow.getUTCDate()} ${month[datenow.getUTCMonth()]} ${datenow.getUTCFullYear()} ${datenow.getUTCHours()}:${datenow.getUTCMinutes()}:${datenow.getUTCSeconds()}`

  res.set('Expires', 0) // rfc2616 - Section 14.21
  res.set('Last-Modified', gmnow)
  res.set('Cache-Control','no-store, no-cache, must-revalidate') // HTTP/1.1
  res.set('Cache-Control','pre-check=0, post-check=0, max-age=0') // HTTP/1.1
  res.set('Pragma','no-cache') // HTTP/1.0
  res.set('Content-Type','text/html; charset=utf-8')
  res.set('X-Robots-Tag','noindex')

  res.render('install/install_config', {POST: req.body, config, fs, os})
})

module.exports = router
