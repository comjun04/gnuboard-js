const debug = require('debug')('gnuboard-js:manager:BoardArticle')
const Collection = require('@discordjs/collection')

const Article = require('../models/article')

class BoardArticleManager {
  constructor(server, board) {
    this.server = server
    this.board = board
  }

  async init() {
    debug('get all articles in board ' + this.board.id)
    const tempList = await this.server.knex(this.board.tableName).select()

    const articles = new Collection()
    const tempArticles = tempList.filter((a) => !a.wr_is_comment)
    for(let a of tempArticles) {
      const article = new Article(this.server, a.wr_id)
      article.board = this.board
      await article.init()

      debug('setup properties for article id ' + article.id)
      article.num = a.wr_num
      article.reply = a.wr_reply
      article.parent = a.wr_parent
      article.comment = a.wr_comment
      article.commentReply = a.wr_comment_reply
      article.categoryName = a.ca_name,
      article.option = a.wr_option
      article.title = a.wr_subject
      article.content = a.wr_content
      article.seoTitle = a.wr_seo_title

      article.link = [{
        link: a.wr_link1,
        hit: a.wr_link1_hit
      },
      {
        link: a.wr_link2,
        hit: a.wr_link2
      }]

      article.hit = a.wr_hit
      article.like = a.wr_good
      article.dislike = a.wr_nogood
      article.author = a.mb_id // TODO use Member Object instead of id
      article.passsword = a.wr_password
      article.createdAt = a.wr_datetime
      article.file = a.wr_file
      article.lastEdited = a.wr_last
      article.ip = a.wr_ip
      article.facebookUser = a.wr_facebook_user
      article.twitterUser = a.wr_twitter_user

      article.extraField = []
      for(let i = 1; i <= 10; i++) {
        article.extraField.push(a[`wr_${i}`])
      }

      articles.set(article.id, article)
    }
    this.articles = articles

    // TODO Comments
  }
}

module.exports = BoardArticleManager
