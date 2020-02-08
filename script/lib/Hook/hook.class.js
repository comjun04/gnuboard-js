/**
 * Library for handling hooks.
 *
 * @author    Josantonius <hello@josantonius.com>
 * @copyright 2017 (c) Josantonius - PHP-Hook
 * @license   https://opensource.org/licenses/MIT - The MIT License (MIT)
 * @link      https://github.com/Josantonius/PHP-Hook
 * @since     1.0.0
 */

/**
 * Hook handler.
 *
 * @since 1.0.0
 */
class Hook {
  static _class = Hook

  /**
   * Instance id.
   *
   * @since 1.0.5
   *
   * @var int
   *
   * @protected
   */
  static id = '0'

  /**
   * Instances.
   * 
   * @since 1.0.0
   * 
   * @var array
   *
   * @private
   */
  static instances = new Map()

  /**
   * Current action hook.
   * 
   * @since 1.0.3
   *
   * @var string|false
   *
   * @protected
   */
  static current = false

  constructor() {
    /**
     * Callbacks.
     * 
     * @since 1.0.3
     * 
     * @var array
     *
     * @protected
     */
    this.callbacks = new Map()

    /**
     * Number of actions executed.
     *
     * @since 1.0.3
     *
     * @var array
     *
     * @protected
     */
    this.actions = new Map([
      ['count', 0]
    ])

    /**
     * Method to use the singleton pattern and just create an instance.
     *
     * @since 1.0.0
     *
     * @var string
     *
     * @protected
     */
    this.singleton = 'getInstance'
  }

  // 이부분 수정
  /*
  public static function getInstance($id = '0')
  {
    self::$id = $id;
    if (isset(self::$instances[self::$id])) {
      return self::$instances[self::$id];
    }

    return self::$instances[self::$id] = new self;
  }
  */

  static getInstance(id = '0', calledClass) {
    this.id = id
    if (this.instances.get(this.id) !== undefined) {
      return this.instances.get(this.id)
    }

    return this.instances[this.id] = new calledClass()
  }

  /**
   * Attach custom function to action hook.
   * 
   * @since 1.0.3
   * 
   * @param string   $tag      → action hook name
   * @param callable $func     → function to attach to action hook
   * @param int      $priority → order in which the action is executed
   * @param int      $args     → number of arguments accepted
   * 
   * @return bool
   *
   * @public
   */
  static addAction(tag, func, prioirty = 8, args = 0) {
    let that = this.getInstance(this.id, this._class)
    
    if(!Array.isArray(that.callbacks.get(tag))) that.callbacks.set(tag, [])
    let _arr = that.callbacks.get(tag)
    if(Array.isArray(_arr[prioirty])) _arr[prioirty] = []
    _arr[prioirty].push(new Map([
      ['function', func],
      ['arguments', args]
    ]))
    that.callbacks.set(tag, _arr)

    return true
  }

  /**
   * Add actions hooks from array.
   *
   * @since 1.0.3
   *
   * @param array $actions
   *
   * @return bool
   *
   * @public
   */
  static addActions(actions) {
    actions.forEach((_arguments) => {
      this.addAction.apply(null, _arguments)
    })
  }

  /**
   * Run all hooks attached to the hook.
   *
   * By default it will look for getInstance method to use singleton
   * pattern and create a single instance of the class. If it does not
   * exist it will create a new object.
   *
   * @see setSingletonName() for change the method name.
   *
   * @since 1.0.3
   *
   * @param string $tag    → action hook name
   * @param mixed  $args   → optional arguments
   * @param bool   $remove → delete hook after executing actions
   *
   * @return returns the output of the last action or false
   *
   * @public
   */

  static doAction(tag, args = [], remove = true) {
    let that = this.getInstance(this.id, this._class)

    this.current = tag

    that.actions.set('count', that.actions.get('count')++)

    if(that.actions.has(tag)) {
      that.actions.set(tag, 0)
    }

    that.actions.set(tag, that.actions.get(tag)++)
    let actions = that.getActions(tag, remove)
    //asort($actions);
    // 이 부분 수정 priority 로 정렬 하려면 ksort를 써야함
    actions = new Map([...actions.entries()].sort())

    actions.forEach((prioirty) => {
      prioirty.forEach((action) => {
        action = that.runAction(action, args)
      })
    })

    this.current = false
    
    return action != null ? action : false
  }

  /**
   * Set method name for use singleton pattern.
   *
   * @since 1.0.0
   *
   * @param string $method → singleton method name
   *
   * @public
   */
  static setSingletonName(method) {
    let that = this.getInstance(this.id, this._class)

    that.singleton = method
  }

  /**
   * Returns the current action hook.
   *
   * @since 1.0.3
   *
   * @return string|false → current action hook
   *
   * @public
   */
  static currentFunc() {
    return this.current
  }

  /**
   * Check if there is a certain action hook.
   *
   * @since 1.0.7
   *
   * @param string $tag → action hook name
   *
   * @return bool
   *
   * @public
   */
  static isAction(tag) {
    let that = this.getInstance(this.id, this._class)

    return that.callbacks.get(tag) != null
  }

  /**
   * Run action hook.
   *
   * @since 1.0.3
   *
   * @param string $action → action hook
   * @param int    $args   → arguments
   *
   * @return callable|false → returns the calling function
   *
   * @protected
   */
  runAction(action, args) {
    let _function = action.get('function')
    let argsNumber = action.get('arguments')

    let _class = _function[0] != null ? _function[0] : false
    let method = _function[1] != null ? _function[1] : false

    args = this.getArguments(argsNumber, args)

    if(!(_class && method) && typeof _function === 'function') {
      _function.apply(null, args)
    } else if(let obj = _class[this.singleton].call()) {
      if(obj !== false) {
        return obj[method].apply(null, args)
      }
    } else if(typeof _class === 'function') /* class check */ {
      let instance = new _class()

      return instance[method].apply(null, args)
    }

    return null
  }

  /**
   * Get actions for hook
   *
   * @since 1.0.3
   *
   * @param string $tag    → action hook name
   * @param bool   $remove → delete hook after executing actions
   *
   * @return object|false → returns the calling function
   *
   * @protected
   */
  getActions(tag, remove) {
    if(this.callbacks.get(tag) != null) {
      let actions = this.callbacks.get(tag)
      if(remove) {
        this.callbacks.delete(tag)
      }
    }

    return actions != null ? actions : []
  }

  /**
   * Get arguments for action.
   *
   * @since 1.0.3
   *
   * @param int   $argsNumber → arguments number
   * @param mixed $arguments  → arguments
   *
   * @return array → arguments
   *
   * @protected
   */
  getArguments(argsNumber, _arguments)
  {
    if (argsNumber == 1 && typeof _arguments === 'string') {
      return [_arguments]
    } else if (argsNumber === _arguments.length)) {
      return _arguments
    }

    for (let i = 0; i < argsNumber; i++) {
      if (_arguments[i] != null) {
        args[] = _arguments[i]
        continue
      }

      return args
    }

    return []
  }
}

module.exports = Hook
