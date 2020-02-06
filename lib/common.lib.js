const microseconds = require('microseconds')

const pbkdf2 = require('./pbkdf2.compat')

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
    str = str + `<a href="${url}1${add}" class="pg_page pg_start">처음</a>`
  }
  
  let start_page = cur_page
  let end_page = start_page + write_pages - 1
  
  if (end_page >= total_page) end_page = total_page
  
  if (start_page > 1) str = str + `<a href="${url}${start_page - 1}${add}" class="pg_page pg_prev">이전</a>`
  
  if (total_page > 1) {
    for (let k = start_page; k <= end_page; k++) {
      if (cur_page != k) str = str + `<a href="${url}${k}${add}" class="pg_page">${k}<span class="sound_only">페이지</span></a>`
      else str = str + `<span class="sound_only">열린</span><strong class="pg_current">${k}</strong><span class="sound_only">페이지</span>`
    }
  }
  
  if (total_page > end_page) str = str + `<a href="${url}${end_page+1}${add}" class="pg_page pg_next">다음</a>`
  
  if (cur_page < total_page) {
    str = str + `<a href="${url}${total_page}${add}" class="pg_page pg_end">맨끝</a>`
  }

  if (str) return "<nav class=\"pg_wrap\"><span class=\"pg\">{$str}</span></nav>"
  else return ""
}

// 페이징 코드의 <nav><span> 태그 다음에 코드를 삽입

function page_insertbefore(paging_html, insert_html)
{
  if(!paging_html) paging_html = '<nav class="pg_wrap"><span class="pg"></span></nav>'

  return paging_html.replace(/^(<nav[^>]+><span[^>]+>)/gi, '$1' + insert_html)
}

// 페이징 코드의 </span></nav> 태그 이전에 코드를 삽입

function page_insertafter(paging_html, insert_html)
{
  if(!paging_html) paging_html = '<nav class="pg_wrap"><span class="pg"></span></nav>'

  if(/#\n</span></nav>#/gi.test(paging_html)) php_eol = ''
  else php_eol = '\n'

  return paging_html.replace(/#(</span></nav>)$#gi, php_eol + insert_html + '$1')
}
