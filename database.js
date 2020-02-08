const knex = require('knex')
const fs = require('fs')

let dbconfig = fs.existsSync('./dbconfig.js') ? require('./dbconfig') : {} // this file can reload

function create(host, user, pass, db) {
  return knex({
    client: 'mysql',
    connection: {
      host: host || dbconfig.G5_MYSQL_HOST,
      user: user || dbconfig.G5_MYSQL_USER,
      password: pass || dbconfig.G5_MYSQL_PASSWORD,
      database: db || dbconfig.G5_MYSQL_DB
    }
  })
}

async function connectionTest(instance) {
  try {
    await instance.raw('select 1+1 as test')
    console.log('db ok')
    return true
  } catch(err) {
    console.log(err)
    return false
  }
}

function reload() {
  delete require.cache[require.resolve('./dbconfig')]
  dbconfig = require('./dbconfig')
  return create()
}

exports.create = create
exports.connectionTest = connectionTest
exports.reload = reload
