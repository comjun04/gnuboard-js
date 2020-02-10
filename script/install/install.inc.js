const os = require('os')
const fs = require('fs')

const config = require('../../config')

function run(data = {}) {
  let data_path = './' + config.G5_DATA_DIR
  if(!data.title) data.title = config.G5_VERSION + ' 설치'

  // 파일이 존재한다면 설치할 수 없다.
  let dbconfig_file = data_path + '/' + config.G5_DBCONFIG_FILE
  if(fs.existsSync(dbconfig_file)) {
    return {_status: 'DBConfigExists'}
  }

  let exists_data_dir = true // GLOBAL
  // data 디렉토리가 있는가?
  if(!(fs.existsSync(data_path) && fs.lstatSync(data_path).isDirectory())) {
    exists_data_dir = false
  }
  
  let write_data_dir = true // GLOBAL
  // data 디렉토리에 파일 생성 가능한지 검사.
  if(os.platform !== 'win32') {
    try {
      fs.accessSync(data_path, fs.constants.R_OK)
    } catch(err) {
      write_data_dir = false
    }
  }

  return {title: data.title, exists_data_dir, write_data_dir}
}

module.exports = run
