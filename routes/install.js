const express = require('express')
const router = express.Router()

const ejs = require('ejs')
const path = require('path').resolve()
const fs = require('fs')
const os = require('os')

const config = require('../config')

router.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8')
  res.set('X-Robots-Tag', 'noindex')

  res.render('install/index', {config, fs, os})
})

module.exports = router
