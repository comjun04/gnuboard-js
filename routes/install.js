const express = require('express')
const router = express.Router({strict: true})

const ejs = require('ejs')
const path = require('path').resolve()
const fs = require('fs')
const os = require('os')
const slash = require('express-slash')
const crypto = require('crypto')

const config = require('../config')
const commonLib = require('../script/lib/common.lib')
const installFunction = require('../script/install/install.function')
const DB = require('../database')

//const knex = global.knex

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

  res.render('install/install_config', {POST: req.body, config, fs, os, crypto, IP: req.ip})
})

router.get('/install_config/', (req, res) => {
  try {
    res.send(ejs.render("<% let title = config.G5_VERSION + \" 초기환경설정 2/3\" %><%- include('" + path + "/page/install/install.inc.ejs', {title, fs, os}) %><div class=\"ins_inner\"><p>라이센스(License) 내용에 동의하셔야 설치를 계속하실 수 있습니다.</p><div class=\"inner_btn\"><a href=\"../\">뒤로가기</a></div></div>", {config, fs, os}))
  } catch(err) {
    console.error(err)
    res.sendStatus(500)
  }
})

router.post('/ajax.install.check/', async (req, res) => {
  // include_once('../lib/json.lib.php'); // js has built-in json library
  const installFunction = require('../script/install/install.function')

  let data_path = '../' + config.G5_DATA_DIR

  // 파일이 존재한다면 설치할 수 없다.
  let dbconfig_file = data_path + '/' + config.G5_DBCONFIG_FILE
  if(fs.existsSync(dbconfig_file)) {
    res.send(installFunction.install_json_msg('프로그램이 이미 설치되어 있습니다.'))
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
    res.end(installFunction.install_json_msg('잘못된 요청입니다.'))
  }

  let dblink = DB.create(mysql_host, mysql_user, mysql_pass, mysql_db)

  if(!await DB.connectionTest(dblink)) {
    res.end(installFunction.install_json_msg('MySQL Host, User, Password, DB를 확인해 주십시오.'))
  }

  /*
  let select_db = commonLib.sql_select_db(mysql_db, dblink)
  
  if (!select_db) {
    res.end(installFunction.install_json_msg('MySQL DB 를 확인해 주십시오.'))
  }
  */

  if(await dblink.schema.hasTable(table_prefix + 'config')) {
    res.end(installFunction.install_json_msg('주의! 이미 테이블이 존재하므로, 기존 DB 자료가 망실됩니다. 계속 진행하겠습니까?', 'exists'))
  }

  res.end(installFunction.install_json_msg('ok', 'success'))
})

module.exports = router
