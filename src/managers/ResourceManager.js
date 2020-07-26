class ResourceManager {
  constructor() {
    this.css = []
    this.js = []
  }

  addStylesheet(stylesheet, order = 0) {
    if(!this.css.find((css) => css[1] === stylesheet)) this.css.push(order, stylesheet)
  }

  addJavascript(javascript, order = 0) {
    if(!this.js.find((js) => js[1] === javascript)) this.js.push(order, javascript)
  }

  // the sorting part of html_process.run()
  getSorted() {

  }
}

module.exports = ResourceManager
