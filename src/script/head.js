const getDataLib = require('../lib/getData')
const headSubRun = require('./head.sub')

module.exports = async function headRun(req, res, session) {
  // TODO pre_head event
  // TODO theme
  // TODO mobile
  // TODO MASSIVE INCLUDES
  headSubRun(req, res, session)

  // TODO popup layer
  
  // TODO correct_goto_url(G5_ADMIN_URL)
  
  // TODO get menu data
  const menuData = await getDataLib.getMenuDB(session, false, true)
}
