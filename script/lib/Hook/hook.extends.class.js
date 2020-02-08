const Hook = require('./hook.class')

class GML_Hook extends Hook {
  static _class = GML_Hook

  /**
   * @protected
   */
  static current_filter = false

  constructor() {
    /**
     * @protected
     */
    this.filters = new Map([
      ['count', 0]
    ])

    /**
     * @protected
     */
    this.callback_filters = new Map()
  }

    /**
     * @protected
     */
  runAction(action, args) {
    let _function = action.get('function')
    let argsNumber = action.get('arguments')

    let _class = Array.isArray(_function) && _function[0] != null ? _function[0] : false
    let method = Array.isArray(_function) && _function[1] != null ? _function[1] : false

    args = this.getArguments(argsNumber, args)

    if(!(_class && method) && typeof _function === 'function') {
      return _function.apply(null, args)
    } else if(let obj = _class[this.singleton].call()) {
      if(obj !== false) {
      return obj[method].apply(null, args)
    }
  }   else if(typeof _class === 'function' /* class check */) { 
      let instance = new _class()

      return instance[method].apply(null, args)
    }
  }

  /**
   * @protected
   */
  getFilters(tag, remove) {
    let filters;

    if(this.callback_filters.get(tag) != null) {
      filters = this.callback_filters.get(tag)
      if(remove) {
        this.callback_filters.delete(tag)
      }
    }

    return filters != null ? filters : []
  }

  /**
   * @public
   */
  static get_properties(type, is_callback = false) {
    let that = this.getInstance(this.id, this._class)

    if(type === 'event') {
      return is_callback ? that.callbacks : that.actions
    }
  }

  /**
   * @public
   */
  static addFilter(tag, func, prioirty = 8, args = 0) {
    let that = this.getInstance(this.id, this._class)

    if(!Array.isArray(that.callbacks.get(tag))) that.callba
cks.set(tag, [])
    let _arr = that.callbacks.get(tag)
    if(Array.isArray(_arr[prioirty])) _arr[prioirty] = []
    _arr[prioirty].push(new Map([                                ['function', func],
      ['arguments', args]
    ]))
    that.callbacks.set(tag, _arr)

    return true
  }

  /**
   * @public
   */
  static apply_filters(tag, args = [], remove = true) {
    let that = this.getInstace(this.id, this._class)

    this.current_filter = tag

    that.filters.set('count', that.filters.get('count')++)

    if(that.filters.has(tag)) {
      that.filters.set(tag, 0)
    }

    that.filters.set(tag, that.filters.get(tag)++)
    let filters = that.getFilters(tag, remove)
    filters = new Map([...filters.entries].sort())

    let value = args[0]

    filters.forEach((prioirty) => {
      prioirty.forEach((filter) => {
        let replace = that.runAction(filter, args)

        if(replace !== null) {
          value = replace
        }
      })
    })

    this.current_filter = false

    return value
  }

  /**
   * @protected
   */
  getArguments(argsNumber, _arguments) {
    if(argsNumber == 1 && typeof _arguments === 'string') {
      return [_arguments]
    } else if(argsNumber == _arguments.length) {
      return _arguments
    }

    let args = []

    for(let i = 0; i < argsNumber; i++) {
      if(Array.isArray(_arguments) && _arguments[i] != null) {
        args.push(_arguments[i])
      }
    }

    return args
  }

  /**
   * @public
   */
  static remove_filter(tag, func, prioirty) {
    let that = this.getInstance(this.id, this._class)

    let is_remove = false

    if(that.callback_filters.get(tag) != null && that.callback_filters.get(tag)[prioirty] != null) {
      let _arr = []
      that.callback_filters.get(tag)[prioirty].forEach((element) => {
        _arr.push(element.get('function'))
      })
      let found_key = _arr.find(func)

      if(found_key != null) /* not FALSE */ {
        that.callback_filters.get(tag)[prioirty].delete(found_key)
      }
    }

    return is_remove
  }

  /**
   * @public
   */
  static remove_action(tag, func, prioirty) {
    let that = this.getInstance(this.id, this._class)

    let is_remove = false

    if(that.callbacks.get(tag) != null && that.callbacks.get(tag)[prioirty] != null) {
      let _arr = []
      that.callbacks.get(tag)[prioirty].forEach((element) => {
        _arr.push(element.get('function'))
      })
      let found_key = _arr.find(func)

      if(found_key != null) /* not FALSE */ {
        that.callbacks.get(tag)[prioirty].delete(found_key)
      }
    }

    return is_remove
  }
}

module.exports = GML_Hook
