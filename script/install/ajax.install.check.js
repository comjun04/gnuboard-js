const fs = require('fs')
const crypto = require('crypto')

const config = require('../../config.js')
const DB = require('../../database')

const installFunction = require('./install.function')

async function run(req, res) {
  let data_path = '../' + config.G5_DATA_DIR

  // 파일이 존재한다면 설치할 수 없다.
  let dbconfig_file = data_path + '/' + config.G5_DBCONFIG_FILE
  if(fs.existsSync(dbconfig_file)) {
    return {_status: 'AlreadyInstalled'}
  }
  
  let mysql_host = installFunction.safe_install_string_check(req.body.mysql_host, 'json')
  let mysql_user = installFunction.safe_install_string_check(req.body.mysql_user, 'json')
  let mysql_pass = installFunction.safe_install_string_check(req.body.mysql_pass, 'json')
  let mysql_db = installFunction.safe_install_string_check(req.body.mysql_db, 'json')
  let table_prefix = installFunction.safe_install_string_check(req.body.table_prefix.replace(/[^a-zA-Z0-9_]/, '_'))

  let tmp_str = /* isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : */ ''
  let ajax_token = crypto.createHash('md5').update(tmp_str + req.ip + global.appRoot + '').digest('hex')

  let bool_ajax_token = (ajax_token == req.body.ajax_token) ? true : false

  if(!(mysql_host && mysql_user && mysql_pass && mysql_db && table_prefix && bool_ajax_token)) {
    return {_status: 'InvalidRequest'}
  }

  let dblink;

  try {
    dblink = DB.create(mysql_host, mysql_user, mysql_pass, mysql_db)
  
    await DB.connectionTest(dblink)
  } catch(err) {
    return {_status: 'MySQLError'}
  }

  if(await dblink.schema.hasTable(table_prefix + 'config')) {
    return {_status: 'TableExists', db: dblink}
  }

  return {_status: 'OK', db: dblink}
}

module.exports = run
