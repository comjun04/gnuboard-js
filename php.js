const cheerio = require('cheerio')

function gmdate() {
  let datenow = new Date()                                   
  let day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let gmnow = `${day[datenow.getUTCDay()]}, ${datenow.getUTCDate()} ${month[datenow.getUTCMonth()]} ${datenow.getUTCFullYear()} ${datenow.getUTCHours()}:${datenow.getUTCMinutes()}:${datenow.getUTCSeconds()}`
  return gmnow
}

function strip_tags(str, whitelist = '') { // whitelist usage: p, img, pre, ..etc
  const $ = cheerio.load(str)
  let contents = ''
  console.log($("*").not('p'))
  $("*").not(whitelist).each(function() {
    contents += $(this).contents()
  })
  return contents
}

function trim(str, character_mask) {
  let c = RegExp.escape(character_mask)
  return str.replace(new RegExp(`/^${c}+|${c}+$/`, 'g'), '')
}

module.exports = {
  gmdate,
  strip_tags
}
