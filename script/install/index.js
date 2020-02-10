const config = require('../../config')

const installInc = require('./install.inc')

function run(res) {
  res.set('Content-Type', 'text/html; charset=utf-8')
  res.set('X-Robots-Tag', 'noindex')

  let title = config.G5_VERSION + ' 라이센스 확인 1/3'

  let data_installInc = installInc({title})

  return {title, data_installInc}
}

module.exports = run
