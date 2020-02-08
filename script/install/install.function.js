function safe_install_string_check(str, is_json = false, res) {
  let is_check = false
  
  // TODO change regex to use with JS
  if(/#\);(passthru|eval|pcntl_exec|exec|system|popen|fopen|fsockopen|file|file_get_contents|readfile|unlink|include|include_once|require|require_once)\s?#i/g.test(str)) {
    is_check = true
  }

  if(/#\$_(get|post|request)\s?\[.*?\]\s?\)#i/g.test(str)) {
    is_check = true
  }

  if(is_check) {
    let msg = "입력한 값에 안전하지 않는 문자가 포함되어 있습니다. 설치를 중단합니다."
  
    if(is_json) return res.end(install_json_msg(msg))

    return res.end(msg)
  }

  return str
}

function install_json_msg(msg, type = 'error') {
  let error_msg = type === 'error' ? msg : ''
  let success_msg = type === 'success' ? msg : ''
  let exists_msg = type === 'exists' ? msg : ''

  return JSON.stringify({
    error: error_msg,
    success: success_msg,
    exists: exists_msg
  })
}

exports.safe_install_string_check = safe_install_string_check
exports.install_json_msg = install_json_msg
