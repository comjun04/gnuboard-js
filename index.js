const express = require('express')
const ejs = require('ejs')
const slash = require('express-slash')
const path = require('path')
const knex = require('knex')

const DB = require('./database')

const indexRouter = require('./routes/index')
const installRouter = require('./routes/install')

global.appRoot = path.resolve(__dirname)

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

app.listen(4000, () => {console.log('server started')})
