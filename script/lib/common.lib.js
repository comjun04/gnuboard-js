const microseconds = require('microseconds')
const knex = require('knex')

const config = require('../../config')
const common = require('../common')
const pbkdf2 = require('./pbkdf2.compat')
const getDataLib = require('./get_data.lib')

/*************************************************************************
 **
 **  일반 함수 모음
 **
 *************************************************************************/

// 마이크로 타임을 얻어 계산 형식으로 만듦
function get_microtime()
{
  return microseconds.now()
}

// 한페이지에 보여줄 행, 현재페이지, 총페이지수, URL
function get_paging(write_pages, cur_page, total_page, url, add = "")
{
  url = url.replace(/#&amp;page=[0-9]*(&amp;page=)$#/gi, '$1')
  url = url.replace(/#(&amp;)?page=[0-9]*#/gi, '')
  url = url + url.slice(1) === '?' ? 'page=' : '&amp;page='
  
  let str = ''
  if (cur_page > 1) {
    str = str + `<a href="${url}1${add}" class="pg_page pg_start">처음</a>\n`
  }
  
  let start_page = cur_page
  let end_page = start_page + write_pages - 1
  
  if (end_page >= total_page) end_page = total_page
  
  if (start_page > 1) str = str + `<a href="${url}${start_page - 1}${add}" class="pg_page pg_prev">이전</a>\n`
  
  if (total_page > 1) {
    for (let k = start_page; k <= end_page; k++) {
      if (cur_page != k) str = str + `<a href="${url}${k}${add}" class="pg_page">${k}<span class="sound_only">페이지</span></a>\n`
      else str = str + `<span class="sound_only">열린</span><strong class="pg_current">${k}</strong><span class="sound_only">페이지</span>\n`
    }
  }
  
  if (total_page > end_page) str = str + `<a href="${url}${end_page+1}${add}" class="pg_page pg_next">다음</a>\n`
  
  if (cur_page < total_page) {
    str = str + `<a href="${url}${total_page}${add}" class="pg_page pg_end">맨끝</a>\n`
  }

  if (str) return "<nav class=\"pg_wrap\"><span class=\"pg\">{$str}</span></nav>"
  else return ""
}

// 페이징 코드의 <nav><span> 태그 다음에 코드를 삽입

function page_insertbefore(paging_html, insert_html)
{
  if(!paging_html) paging_html = '<nav class="pg_wrap"><span class="pg"></span></nav>'

  return paging_html.replace(/^(<nav[^>]+><span[^>]+>)/gi, '$1' + insert_html + '\n')
}

// 페이징 코드의 </span></nav> 태그 이전에 코드를 삽입

function page_insertafter(paging_html, insert_html)
{
  if(!paging_html) paging_html = '<nav class="pg_wrap"><span class="pg"></span></nav>'

  if(/#\n<\/span><\/nav>#/gi.test(paging_html)) php_eol = ''
  else php_eol = '\n'

  return paging_html.replace(/#(<\/span><\/nav>)$#/gi, php_eol + insert_html + '$1')
}

// 변수 또는 배열의 이름과 값을 얻어냄. print_r() 함수의 변형
//TODO this function RETURNS a value, NOT PRINT to the page.

function print_r2(_var)
{
  let str = ''
  if(_var == Object) str = JSON.stringify(_var)
  else str = _var

  str = str.replace(/ /g, "&nbsp;")
  /* echo */ return `<span style='font-family:Tahoma, 굴림; font-size:9pt;'>${str}</span>`.replace(/\n/g, '<br>')
}

// 메타태그를 이용한 URL 이동
// header("location:URL") 을 대체
// TODO This function RETURNS the page-output string.
function goto_url(url)
{
  url = str_replace("&amp;", "&", $url);
  /* echo */ let _return = "<script> location.replace('$url'); </script>";

//  if (!headers_sent())
//    header('Location: '.$url);
//  else {
//    echo '<script>';
//    echo 'location.replace("'.$url.'");';
//    echo '</script>';
//    echo '<noscript>';
//    echo '<meta http-equiv="refresh" content="0;url='.$url.'" />';
//    echo '</noscript>';
//  }
//  exit;
}

// TODO write it later

/*************************************************************************
 **
 ** SQL 관련 함수 모음
 **
 *************************************************************************/

/*
// DB 연결
function sql_connect(host, user, pass, db = config.G5_MYSQL_DB, res) {
  // global $g5;

  var link = knex({
    client: 'mysql',
    connection: {
      host: host,
      user: user,
      password: pass,
      database: db
    }
  })

  // 연결 오류 발생 시 스크립트 종료
  link.raw('select 1+1 as test')
    .then(() => {return link})
    .catch((err) => {res.end('Connect Error: ' + err)})
}
*/

/*
// DB 선택
function sql_select_db(db, connect) {
  //global $g5;

  // knex doesn't have db switching, so it'll return a new instance.
  
  // uncomment it if you want to destory the old instance.
  // connect.destroy()

  let connection = connect.connection().client.config.connection
  return sql_connect(connection.host, connection.user, connection.password, db)
}
*/

/*
// mysqli_query 와 mysqli_error 를 한꺼번에 처리
// mysql connect resource 지정 - 명랑폐인님 제안
function sql_query(sql, error = config.G5_DISPLAY_SQL_ERROR, link = null) {
// global $g5, $g5_debug;

  if(!link) link = common.g5.get('connect_db')

  // Blind SQL Injection 취약점 해결
  sql = sql.trim()
  // union의 사용을 허락하지 않습니다.
  //$sql = preg_replace("#^select.*from.*union.*#i", "select 1", $sql);
  sql = sql.replace(/#^select.*from.*[\s\(]+union[\s\)]+.*#i /gi, "select 1")
  // `information_schema` DB로의 접근을 허락하지 않습니다.
  sql = sql.replace(/#^select.*from.*where.*`?information_schema`?.*#i/gi, "select 1")

  let is_debug = getDataLib.get_permission_debug_show()
  
  let start_time = is_debug ? get_microtime() : 0

  let result;

  if(error) {
    

  } 
}
*/
