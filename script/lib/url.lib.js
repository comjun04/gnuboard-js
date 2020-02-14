const config = require('../../config')
const PHP = require('../../php')

// FIXME Might doing wrong
function generate_seo_title(string, wordLimit = config.G5_SEO_TITEL_WORD_CUT) {
  let separator = '-';
    
  if(wordLimit != 0){
    let wordArr = string.split(' ')
    string = wordArr.slice(0, wordLimit).join(' ')
  }

  let quoteSeparator = /*RegExp.escape(*/separator/*, '#')*/

  let trans = new Map([
    ['&.+?;', ''],
    ['[^\\w\\d _-ㄱ-ㅎㅏ-ㅣ가-힣]', ''],
    ['\\s+', separator],
    ['(' + quoteSeparator + ')+', separator]
  ])

  string = PHP.strip_tags(string)

  /*
  if(function_exists('mb_convert_encoding') ){
    string = mb_convert_encoding($string, 'UTF-8', 'UTF-8')
  }
  */

  trans.forEach((val, key) => {
    string = string.replace(new RegExp(key, 'iu'), val)
  })

  string = string.toLowerCase()

  return PHP.trim(string, separator).trim()
}

module.exports = {
  generate_seo_title
}
