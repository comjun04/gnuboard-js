const hook = require('./Hook/hook.class')
const hookExtends = require('./Hook/hook.extends.class')

function get_hook_class() {
  // checking 'class'
  if(typeof hookExtends.GML_Hook === 'function') {
    return hookExtends.GML_Hook.getInstance(null, get_hook_class) // passing function itself
  }

  return null
}

function run_replace(tag, arg = '') {
  if(hook = get_hook_class()) {
    let args = []

    if(function (o) {
      try {
        Map.prototype.has.call(o)
        return true
      } catch (err) {
        return false
      }
    }(arg) && arg[0] != null && typeof arg[0] === 'object' && arg.length == 1) {
      args.push(arg[0]) // PASS BY REPERENCE
    } else {
      args.push(arg[0]) // pass by value
    }

    let numArgs = arguments.length

    for(let a = 2; a < numArgs; a++) {
      args.push(arguments[a])
    }
  }
}

module.exports = {
  get_hook_class: get_hook_class,
  run_replace: run_replace
}
