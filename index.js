const express = require('express')
const ejs = require('ejs')
const slash = require('express-slash')
const path = require('path')
const knex = require('knex')

// Global variable init
require('./globals.js')()

const DB = require('./database')

const indexRouter = require('./routes/index')
const installRouter = require('./routes/install')

global.appRoot = path.resolve(__dirname)
global.appPort = 4000 // TODO add this in settings file & remove global

// Database
let db = DB.create()
global.knex = db
if(!DB.connectionTest(db)) {
  console.error('Database Error: Cannot connect!')
}

const app = express()

app.set('view engine', 'ejs')
app.set('views', './page')
app.enable('strict routing')

app.use('/src/', express.static('./src'))
app.use(express.urlencoded({extended: true, limit: '50mb'}))

app.use('/', indexRouter)
app.use(slash())
app.use('/install/', installRouter)

app.listen(global.appPort, () => {console.log('server started')})

// Custom Functions

// RegExp escape function
// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
RegExp.escape = function(s, c) {
  return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&').replace (new RegExp(`/${c}/`, 'g'), '\\$&') // not matching '/'
}
