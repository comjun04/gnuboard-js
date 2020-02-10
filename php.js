function gmdate() {
  let datenow = new Date()                                   
  let day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let gmnow = `${day[datenow.getUTCDay()]}, ${datenow.getUTCDate()} ${month[datenow.getUTCMonth()]} ${datenow.getUTCFullYear()} ${datenow.getUTCHours()}:${datenow.getUTCMinutes()}:${datenow.getUTCSeconds()}`
  return gmnow
}

exports.gmdate = gmdate
