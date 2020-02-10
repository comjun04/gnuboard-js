const crypto = require('crypto')

const PHP = require('../../php')
const config = require('../../config')

const installInc = require('./install.inc')

function run(req, res) {
  let gmnow = PHP.gmdate() + ' GMT'
  res.set('Expires', 0) // rfc2616 - Section 14.21
  res.set('Last-Modified', gmnow)
  res.set('Cache-Control','no-store, no-cache, must-revalidate') // HTTP/1.1
  res.set('Cache-Control','pre-check=0, post-check=0, max-age=0') // HTTP/1.1
  res.set('Pragma','no-cache') // HTTP/1.0
  res.set('Content-Type','text/html; charset=utf-8')
  res.set('X-Robots-Tag','noindex')

  let title = config.G5_VERSION + " 초기환경설정 2/3"

  let data_installInc = installInc({title})

  if(req.body.agree !== '동의함') {
    return {_status: 'LicenseNotAgree', data_installInc}
  }

  let tmp_str = /* isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : */ ''
  let ajax_token = crypto.createHash('md5').update(tmp_str + req.ip + global.appRoot + '').digest('hex')

  return {ajax_token, data_installInc}
}

module.exports = run
