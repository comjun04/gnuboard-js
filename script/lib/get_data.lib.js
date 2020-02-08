const common = require('../common')
const config = require('../../config')
const hookLib = require('./hook.lib')

function get_permission_debug_show() {
  let bool = false
  if(config.G5_DEBUG) {
    bool = true
  }

  return hookLib.run_replace('get_permission_debug_show', bool, common.member)
}

exports.get_permission_debug_show = get_permission_debug_show
