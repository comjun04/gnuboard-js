const debug = require('debug')('gnuboard-js:manager:Board')
const Collection = require('@discordjs/collection')

const Board = require('../models/board')

class BoardManager {
  constructor (server) {
    this.server = server
  }

  async init () {
    debug('get all boards')
    const tempBoards = await this.server.knex(this.server.dbconfig.boardTable).select()
    
    // TODO refactor the data
    const boards = new Collection()
    for (const b of tempBoards) {
      // const board = Object.assign(new Board(this.server), b)

      const board = new Board(this.server, b.bo_table)
      await board.init()

      debug('setup properties for board ' + board.id)
      board.group = b.gr_id // TODO use BoardGroup Object instead of id
      board.title = b.bo_subject
      board.mobileTitle = b.bo_mobile_subject
      board.device = b.bo_device
      board.admin = b.bo_admin // TODO use Member Object instead of name

      board.permissions = {
        list: b.bo_list_level,
        read: b.bo_read_level,
        write: b.bo_write_level,
        reply: b.bo_reply_level,
        comment: b.bo_comment_level,
        upload: b.bo_upload_level,
        download: b.bo_download_level,
        writeHtml: b.bo_html_level,
        link: b.bo_link_level
      }

      board.maxCommentToModify = b.bo_count_modify
      board.maxCommentToDelete = b.bo_count_delete

      board.points = {
        read: b.bo_read_point,
        write: b.bo_write_point,
        comment: b.bo_comment_point,
        download: b.bo_download_point
      }

      board.useCategory = !!b.bo_use_category
      board.categoryList = b.bo_category_list.split('|')

      board.useSideview = !!b.bo_use_sideview
      board.useFileContent = !!b.bo_use_file_content
      board.secret = !!b.bo_use_secret
      board.useDHtmlEditor = !!b.bo_use_dhtml_editor
      board.useRssView = !!b.bo_use_rss_view
      board.useLike = !!b.bo_use_good
      board.useDislike = !!b.bo_use_nogood
      board.useName = !!b.bo_use_name
      board.useSignature = !!b.bo_use_signature
      board.showIp = !!b.bo_use_ip_view
      board.useListview = !!b.bo_use_list_view
      board.useListFile = !!b.bo_use_list_file
      board.useListContent = !!b.bo_use_list_content
      board.tableWidth = b.bo_table_width
      board.articleTitleLength = b.bo_subject_len
      board.mobileArticleTitleLength = b.bo_mobile_subject_len
      board.pageRow = b.bo_page_rows
      board.mobilePageRow = b.bo_mobile_page_rows
      board.newArticleHour = b.bo_new
      board.popularArticleViews = b.bo_hot
      board.imageWidth = b.bo_image_width
      board.skin = b.bo_skin
      board.mobileSkin = b.bo_mobile_skin
      board.includeHead = b.bo_include_head
      board.includeTail = b.bo_include_tail
      board.contentHead = b.bo_content_head
      board.mobileContentHead = b.bo_mobile_content_head
      board.contentTail = b.bo_content_tail
      board.mobileContentTail = b.bo_mobile_content_tail
      board.insertContent = b.bo_insert_content

      board.gallery = {
        column: b.bo_gallery_cols,
        width: b.bo_gallery_width,
        height: b.bo_gallery_height,
        mobileWidth: b.bo_mobile_gallery_width,
        mobileHeight: b.bo_mobile_gallery_height
      }

      board.uploadSize = b.bo_upload_size
      board.replyOrder = b.bo_reply_order
      board.useSearch = !!b.bo_use_search
      board.order = b.bo_order
      // bo_count_write: 1
      // bo_count_comment: 0
      board.writeMinChar = b.bo_write_min
      board.writeMaxChar = b.bo_write_max
      board.commentMinChar = b.bo_comment_min
      board.commentMaxChar = b.bo_comment_max

      const tmpNoticeSplit = b.bo_notice.split(',')
      board.noticeArticle = board.articles.articles.filter((a) => tmpNoticeSplit.includes(a.id))

      board.uploadLimit = b.bo_upload_count
      board.useEmail = !!b.bo_use_email
      board.useCert = !!b.bo_use_cert
      board.useSns = !!b.bo_use_sns
      board.useCaptcha = !!b.bo_use_captcha
      board.sortField = b.bo_sort_field

      board.extraField = []
      for (let i = 1; i <= 10; i++) {
        board.extraField.push({
          name: b[`bo_${i}_subj`],
          value: b[`bo_${i}`]
        })
      }

      boards.set(board.id, board)
    }

    this.boards = boards
  }

  get (id) {
    debug('get board ' + id)
    return this.boards.find((b) => b.id === id)
  }

  async add () {
    // TODO
  }

  async delete () {
    // TODO
  }
}

module.exports = BoardManager
