const debug = require('debug')('gnuboard-js:models:board')

const BoardArticleManager = require('../managers/BoardArticleManager')

class Board {
  constructor(server, id) {
    this.server = server
    this.id = id
    this.tableName = this.server.dbconfig.writePrefix + id
  }

  async init() {
    debug('init board ' + this.id)
    this.articles = new BoardArticleManager(this.server, this)
    await this.articles.init()
  }

  async getLatestArticles(rows = 10) {
    debug(`get latest ${rows} articles in board '${this.id}'`)

    // TODO cache

    const articles = this.articles.articles
    const list = []
    articles.forEach((a) => {
      const article = a.formatForListview()
      // TODO thumbnail

      list.push(article)
    })

    // TODO cache

    return list
  }
}

module.exports = Board
