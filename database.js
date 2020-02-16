const knex = require('knex')
const fs = require('fs')

const _config = require('./config')
const config = _config()

let file = `${config.G5_DATA_DIR}/${config.G5_DBCONFIG_FILE}`
let dbconfig = fs.existsSync(__dirname + '/' + file) ? require('./' + file) : {} // this file can reload

function create(host, user, pass, db) {
  return knex({
    client: 'mysql',
    connection: {
      host: host || dbconfig.G5_MYSQL_HOST,
      user: user || dbconfig.G5_MYSQL_USER,
      password: pass || dbconfig.G5_MYSQL_PASSWORD,
      database: db || dbconfig.G5_MYSQL_DB
    },
    debug: false,
    asyncStackTraces: true // debug
  })
}

async function connectionTest(instance) {
  try {
    await instance.raw('select 1+1 as test')
    return true
  } catch(err) {
    throw err
  }
}

/*
function reload() {
  delete require.cache[require.resolve('./dbconfig')]
  dbconfig = require('./dbconfig')
  return create()
}
*/

exports.create = create
exports.connectionTest = connectionTest
//exports.reload = reload
