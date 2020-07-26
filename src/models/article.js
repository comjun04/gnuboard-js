const debug = require('debug')('gnuboard-js:models:article')

const sanitizeHtml = require('../utils/sanitizeHtml')

class Article {
  constructor(server, id) {
    this.server = server
    this.id = id
  }

  async init() {
    debug('init article id ' + this.id)
  }

  /**
   * 게시물 정보를 출력하기 위하여 정보 가공
   */
  formatForListview(titleLength = 40) {
    const newArticle = {}

    //$g5_object->set('bbs', $write_row['wr_id'], $write_row, $board['bo_table']);

    newArticle.isNotice = this.board.noticeArticle.has(this.id)

    if(titleLength) {
      newArticle.title = this.convertTitle(titleLength, '...')
    } else {
      newArticle.title = this.convertTitle(this.board.articleTitleLength, '...')
    }

    // TODO SEO title update

    // 목록에서 내용 미리보기 사용한 게시판만 내용을 변환함 (속도 향상)
    
    if(this.board.useListContent) {
      let html = 0

      if(this.option === 'html1') html = 1
      else if (this.option === 'html2') html = 2

      newArticle.content = this.convertContent(html)
    }

    // TODO Comment count
    newArticle.commentCount = 0

    // TODO datetime
    // TODO lastEdited
    // TODO homepage
    // TODO username
    // TODO etc etc etc

    return newArticle
  }

  convertTitle(length, suffix) {
    return this.title.slice(0, length) + suffix
  }

  convertContent(html, filter = true) {
    let content = this.content

    if(html) {
      const from = ['//']
      const to = ['']

      if(html === 2) {
        from.push('\n')
        to.push('<br/>')
      }

      // 테이블 태그의 개수를 세어 테이블이 깨지지 않도록 한다.
      let tmp = content.match(/<table/gi)
      const tableBeginCount = Array.isArray(tmp) ? tmp.length : 0
      tmp = content.match(/<\/table/gi)
      const tableEndCount = Array.isArray(tmp) ? tmp.length : 0
      for (let i = tableEndCount; i < tableBeginCount; i++) {
        content += '</table>'
      }

      for(let i = 0; i < from.length; i++) {
        content = content.replace(new RegExp(from[i], 'g'), to[i])
      }

      if(filter) content = sanitizeHtml.html(content)
    } else { // text일 경우
      content = content.replace(/ /g, '&nbsp; ')
        .replace(/\n /g, '\n&nbsp; ')

      content = sanitizeHtml.text(content)
      // TODO url_auto_link
    }

    return content
  }
}

module.exports = Article
