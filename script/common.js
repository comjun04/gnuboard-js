//const config = require(g5_path().path + '/config')
const config = require('../config')

/*******************************************************************************
** 공통 변수, 상수, 코드
*******************************************************************************/

function run(req, res) {
  res.set('P3P', 'CP="ALL CURa ADMa DEVa TAIa OUR BUS IND PHY ONL UNI PUR FIN COM NAV INT DEM CNT STA POL HEA PRE LOC OTC"')

  //==========================================================================================================================
  // extract($_GET); 명령으로 인해 page.php?_POST[var1]=data1&_POST[var2]=data2 와 같은 코드가 _POST 변수로 사용되는 것을 막음
  // 081029 : letsgolee 님께서 도움 주셨습니다.
  //--------------------------------------------------------------------------------------------------------------------------
  /*
$ext_arr = array ('PHP_SELF', '_ENV', '_GET', '_POST', '_FILES', '_SERVER', '_COOKIE', '_SESSION', '_REQUEST',
                  'HTTP_ENV_VARS', 'HTTP_GET_VARS', 'HTTP_POST_VARS', 'HTTP_POST_FILES', 'HTTP_SERVER_VARS',
                  'HTTP_COOKIE_VARS', 'HTTP_SESSION_VARS', 'GLOBALS');
$ext_cnt = count($ext_arr);
for ($i=0; $i<$ext_cnt; $i++) {
    // POST, GET 으로 선언된 전역변수가 있다면 unset() 시킴
    if (isset($_GET[$ext_arr[$i]]))  unset($_GET[$ext_arr[$i]]);
    if (isset($_POST[$ext_arr[$i]])) unset($_POST[$ext_arr[$i]]);
} */

  let _g5_path = g5_path(req)

  config({path: _g5_path.path, url: _g5_path.url}) // 설정 파일

  _g5_path = undefined

//==========================================================================================================================

  // Global variable define: <root>/globals.js
  //global.member = new Map()
  //global.g5 = new Map()

  return
}

function g5_path(req)
{
  /*
  let chroot = substr($_SERVER['SCRIPT_FILENAME'], 0, strpos($_SERVER['SCRIPT_FILENAME'], dirname(__FILE__)));
  let result['path'] = str_replace('\\', '/', $chroot.dirname(__FILE__));
  let server_script_name = preg_replace('/\/+/', '/', str_replace('\\', '/', $_SERVER['SCRIPT_NAME']));
  let server_script_filename = preg_replace('/\/+/', '/', str_replace('\\', '/', $_SERVER['SCRIPT_FILENAME']));
  let tilde_remove = preg_replace('/^\/\~[^\/]+(.*)$/', '$1', $server_script_name);
  let document_root = str_replace($tilde_remove, '', $server_script_filename);
  let pattern = '/.*?' . preg_quote($document_root, '/') . '/i';
  let root = preg_replace($pattern, '', $result['path']);
  let port = ($_SERVER['SERVER_PORT'] == 80 || $_SERVER['SERVER_PORT'] == 443) ? '' : ':'.$_SERVER['SERVER_PORT'];
  let http = 'http' . ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']=='on') ? 's' : '') . '://';
  let user = str_replace(preg_replace($pattern, '', $server_script_filename), '', $server_script_name);
  let host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : $_SERVER['SERVER_NAME'];
  if(isset($_SERVER['HTTP_HOST']) && preg_match('/:[0-9]+$/', $host)) host = preg_replace('/:[0-9]+$/', '', $host);
  host = preg_replace("/[\<\>\'\"\\\'\\\"\%\=\(\)\/\^\*]/", '', $host);
    $result['url'] = $http.$host.$port.$user.$root;
  */
  let result = {}
  result.path = global.appRoot // useless
  result.url = `${req.protocol}://${req.hostname}${![80, 443].includes(global.appPort) ? `:${global.appPort}` : ''}`

  return result
}

// multi-dimensional array에 사용자지정 함수적용
function array_map_deep(fn, array)
{
  if(Array.isArray(array) || array instanceof Map) {
    array.forEach((value, key) => {
      if(Array.isArray(value) || array instanceof Map) {
        if (Array.isArray(value)) array[key] = array_map_deep(fn, value)
        else array.set(key, array_map_deep(fn, value))
      } else {
        if(Array.isArray(value)) array[key] = fn.call(null, value)
        else array.set(key, fn.call(null, value))
      }
    })
  } else {
    array = fn.call(null, array)
  }

  return array
}

module.exports = run
