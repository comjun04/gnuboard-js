const express = require('express')
const debug = require('debug')('gnuboard-js:main')
const debugweb = require('debug')('gnuboard-js:web')

const config = require('../config')
const dbconfig = require('../dbconfig')
const BoardManager = require('./managers/BoardManager')

class Gnuboard {
  constructor() {
    // Config
    this.config = config || {}
    this.dbconfig = dbconfig || {}

    // Database
    this.knex = require('knex')(dbconfig.knex)

    // Create App
    const app = express()

    app.set('view engine', 'ejs')
    app.set('views', 'src/views')

    // Log all requests
    app.use((req, _, next) => {
      debugweb(`${req.method} ${req.originalUrl}`)
      req.server = this
      next()
    })

    this.app = app
    this.registerRouters()
  }

  registerRouters() {
    // Router
    const indexRouter = require('./router/index')
    this.app.use('/', indexRouter)
  }

  async setupManagers() {
    // Board Manager
    this.boards = new BoardManager(this)
    await this.boards.init()
  }

  start() {
    this.app.listen(5000, () => {
      console.log('server is live on port 5000')
    })
  }
}

module.exports = Gnuboard
