const sanitize = require('sanitize-html')
const debug = require('debug')('gnuboard-js:utils:sanitizeHtml')

const config = require('../../config')

module.exports.html = function sanitize2Html(html) {
  const safeIframe = config.safeIframe || []

  // TODO 내 도메인 추가

  // TODO video whitelist

  debug('sanitize')
  return sanitize(html, {
    allowedIframeHostnames: safeIframe
  })
}

module.exports.text = function sanitize2Text(html) {
  return sanitize(html, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'escape'
  })
}
