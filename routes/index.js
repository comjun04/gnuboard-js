const express = require('express')
const router = express.Router()

const index = require('../script/index')

router.get('/', (req, res) => {
  let data = index(req, res)
  res.render('index', {data})
})

module.exports = router
