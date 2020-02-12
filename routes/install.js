const express = require('express')
const router = express.Router({strict: true})

const path = require('path').resolve()
const slash = require('express-slash')
const fs = require('fs')

const config = require('../config')
const commonLib = require('../script/lib/common.lib')
const installFunction = require('../script/install/install.function')
const DB = require('../database')

const ajaxInstallCheck = require('../script/install/ajax.install.check')
const installDB = require('../script/install/install_db')
const installConfig = require('../script/install/install_config')
const index = require('../script/install/index')

router.get('/', (req, res) => {
  let data = index(res)
  res.render('install/index', {data, fs, config})
})

router.use(slash())

router.post('/install_config/', (req, res) => {
  let data = installConfig(req, res)
  res.render('install/install_config', {data, config})
})

router.get('/install_config/', (req, res) => {
  let data = installConfig(req, res)
  res.render('install/install_config', {data, config})
})

router.post('/ajax.install.check/', async (req, res) => {
  // include_once('../lib/json.lib.php'); // js has built-in json library
  
  let data = await ajaxInstallCheck(req, res)

  if(data._status === 'AlreadyInstalled') {
    res.end(installFunction.install_json_msg('프로그램이 >이미 설치되어 있습니다.'))
  } else if(data._status === 'InvalidRequest') {
    res.end(installFunction.install_json_msg('잘못된 요청입니다.'))
  } else if(data._status === 'MySQLError') {
    res.end(installFunction.install_json_msg('MySQL Host, User, Password, DB를 확인해 주십시오.'))
  } else if(data._status === 'TableExists') {
    res.end(installFunction.install_json_msg('주의! 이미 테이블이 존재하므로, 기존 DB 자료가 망실됩니다. 계속 진행하겠습니까?', 'exists'))
  } else if(data._status === 'OK') {
    res.end(installFunction.install_json_msg('ok', 'success'))
  } else {
    res.sendStatus(500)
    throw new Error('StatusError: Invalid status code: ' + statusCode) // TODO make it to module
  }
})

router.post('/install_db/', async (req, res) => {
  let data = await installDB(req, res)
  res.render('install/install_db', {data, config})
})

module.exports = router
