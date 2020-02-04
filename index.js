const express = require('express')
const ejs = require('ejs')

const indexRouter = require('./routes/index')
const installRouter = require('./routes/install')

const app = express()

app.set('view engine', 'ejs')
app.set('views', './page')

app.use('/src', express.static('./src'))

app.use('/', indexRouter)
app.use('/install', installRouter)

app.listen(4000, () => {console.log('server started')})
