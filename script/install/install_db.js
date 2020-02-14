const PHP = require('../../php')
const DB = require('../../database')
const config = require('../../config')

const commonLib = require('../lib/common.lib')
const installFunction = require('./install.function')
const installInc = require('./install.inc')

async function run(req, res, data = {}) {
  let returnData = {}

  let gmnow = PHP.gmdate() + ' GMT'
  res.set('Expires', 0) // rfc2616 - Section 14.21
  res.set('Last-Modified', gmnow)
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate') // HTTP/1.1
  res.set('Cache-Control', 'pre-check=0, post-check=0, max-age=0') // HTTP/1.1
  res.set('Pragma', 'no-cache') // HTTP/1.0
  res.set('Content-Type', 'text/html; charset=utf-8')
  res.set('X-Robots-Tag', 'noindex')

  let title = config.G5_VERSION + ' 설치 완료 3/3'
  returnData.data_installInc = installInc({ title })

  let mysql_host = installFunction.safe_install_string_check(req.body.mysql_host)
  let mysql_user = installFunction.safe_install_string_check(req.body.mysql_user)
  let mysql_pass = installFunction.safe_install_string_check(req.body.mysql_pass)
  let mysql_db = installFunction.safe_install_string_check(req.body.mysql_db)
  let table_prefix = installFunction.safe_install_string_check(req.body.table_prefix)
  let admin_id = req.body.admin_id
  let admin_pass = req.body.admin_pass
  let admin_name = req.body.admin_name
  let admin_email = req.body.admin_email

  if (/[^0-9a-z_]+/i.test(admin_id)) {
    returnData._status = 'UnsafeAdminID'
    return returnData
  }

  let dblink = DB.create(mysql_host, mysql_user, mysql_pass, mysql_db)
  try {
    await DB.connectionTest(dblink)
  } catch (err) {
    returnData._status = 'MySQLError'
    return returnData
  }
  /*
  let mysql_set_mode = false
  commonLib.sql_set_charset(config.G5_DB_CHARSET, dblink)

  let result = await dblink.raw('select @@sql_mode as mode')
  */

  // 테이블 생성 ------------------------------------
  // 기존 sql파일에서 불러와서 하는 방식에서 스크립트에서 쿼리 실행하는 방식으로 변경
  try {
    await dblink.transaction(async (trx) => {
      try {
        await dblink.schema.dropTableIfExists(table_prefix + 'auth')
        await dblink.schema.createTable(table_prefix + 'auth', (table) => {
          table.string('mb_id', 20).notNullable().defaultTo('')
          table.string('au_menu', 20).notNullable().defaultTo('')
          table.specificType('au_auth', `set('r', 'w', 'd')`).notNullable().defaultTo('') // knex does not have set() type (or mysql function)
          table.primary(['mb_id', 'au_menu'])
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'board')
        await dblink.schema.createTable(table_prefix + 'board', (table) => {
          table.string('bo_table', 20).notNullable().defaultTo('').primary()
          table.string('gr_id', 255).notNullable().defaultTo('')
          table.string('bo_subject', 255).notNullable().defaultTo('')
          table.string('bo_mobile_subject', 255).notNullable().defaultTo('')
          table.enu('bo_device', ['both', 'pc', 'mobile']).notNullable().defaultTo('both')
          table.string('bo_admin', 255).notNullable().defaultTo('')
          table.specificType('bo_list_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_read_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_write_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_reply_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_comment_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_upload_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_download_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_html_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_link_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_count_delete', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_count_modify', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('bo_read_point').notNullable().defaultTo(0)
          table.integer('bo_write_point').notNullable().defaultTo(0)
          table.integer('bo_comment_point').notNullable().defaultTo(0)
          table.integer('bo_download_point').notNullable().defaultTo(0)
          table.specificType('bo_use_category', 'tinyint(4)').notNullable().defaultTo(0)
          table.text('bo_category_list').notNullable()
          table.specificType('bo_use_sideview', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_file_content', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_secret', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_dhtml_editor', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_rss_view', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_good', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_nogood', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_name', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_signature', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_ip_view', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_list_view', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_list_file', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_list_content', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('bo_table_width').notNullable().defaultTo(0)
          table.integer('bo_subject_len').notNullable().defaultTo(0)
          table.integer('bo_mobile_subject_len').notNullable().defaultTo(0)
          table.integer('bo_page_rows').notNullable().defaultTo(0)
          table.integer('bo_mobile_page_rows').notNullable().defaultTo(0)
          table.integer('bo_new').notNullable().defaultTo(0)
          table.integer('bo_hot').notNullable().defaultTo(0)
          table.integer('bo_image_width').notNullable().defaultTo(0)
          table.string('bo_skin', 255).notNullable().defaultTo('')
          table.string('bo_mobile_skin', 255).notNullable().defaultTo('')
          table.string('bo_include_head', 255).notNullable().defaultTo('')
          table.string('bo_include_tail', 255).notNullable().defaultTo('')
          table.text('bo_content_head').notNullable()
          table.text('bo_mobile_content_head').notNullable()
          table.text('bo_content_tail').notNullable()
          table.text('bo_mobile_content_tail').notNullable()
          table.text('bo_insert_content').notNullable()
          table.integer('bo_gallery_cols').notNullable().defaultTo(0)
          table.integer('bo_gallery_width').notNullable().defaultTo(0)
          table.integer('bo_gallery_height').notNullable().defaultTo(0)
          table.integer('bo_mobile_gallery_width').notNullable().defaultTo(0)
          table.integer('bo_mobile_gallery_height').notNullable().defaultTo(0)
          table.integer('bo_upload_size').notNullable().defaultTo(0)
          table.specificType('bo_reply_order', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_search', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('bo_order').notNullable().defaultTo(0)
          table.integer('bo_count_write').notNullable().defaultTo(0)
          table.integer('bo_count_comment').notNullable().defaultTo(0)
          table.integer('bo_write_min').notNullable().defaultTo(0)
          table.integer('bo_write_max').notNullable().defaultTo(0)
          table.integer('bo_comment_min').notNullable().defaultTo(0)
          table.integer('bo_comment_max').notNullable().defaultTo(0)
          table.text('bo_notice').notNullable()
          table.specificType('bo_upload_count', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_email', 'tinyint(4)').notNullable().defaultTo(0)
          table.enu('bo_use_cert', ['', 'cert', 'adult', 'hp-cert', 'hp-adult']).notNullable().defaultTo('')
          table.specificType('bo_use_sns', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('bo_use_captcha', 'tinyint(4)').notNullable().defaultTo(0)
          table.string('bo_soft_field', 255).notNullable().defaultTo('')
          table.string('bo_1_subj', 255).notNullable().defaultTo('')
          table.string('bo_2_subj', 255).notNullable().defaultTo('')
          table.string('bo_3_subj', 255).notNullable().defaultTo('')
          table.string('bo_4_subj', 255).notNullable().defaultTo('')
          table.string('bo_5_subj', 255).notNullable().defaultTo('')
          table.string('bo_6_subj', 255).notNullable().defaultTo('')
          table.string('bo_7_subj', 255).notNullable().defaultTo('')
          table.string('bo_8_subj', 255).notNullable().defaultTo('')
          table.string('bo_9_subj', 255).notNullable().defaultTo('')
          table.string('bo_10_subj', 255).notNullable().defaultTo('')
          table.string('bo_1', 255).notNullable().defaultTo('')
          table.string('bo_2', 255).notNullable().defaultTo('')
          table.string('bo_3', 255).notNullable().defaultTo('')
          table.string('bo_4', 255).notNullable().defaultTo('')
          table.string('bo_5', 255).notNullable().defaultTo('')
          table.string('bo_6', 255).notNullable().defaultTo('')
          table.string('bo_7', 255).notNullable().defaultTo('')
          table.string('bo_8', 255).notNullable().defaultTo('')
          table.string('bo_9', 255).notNullable().defaultTo('')
          table.string('bo_10', 255).notNullable().defaultTo('')

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'board_file')
        await dblink.schema.createTable(table_prefix + 'board_file', (table) => {
          table.string('bo_table', 20).notNullable().defaultTo('')
          table.integer('wr_id').notNullable().defaultTo(0)
          table.integer('bf_no').notNullable().defaultTo(0)
          table.string('bf_source', 255).notNullable().defaultTo('')
          table.string('bf_file', 255).notNullable().defaultTo('')
          table.integer('bf_download').notNullable()
          table.text('bf_content').notNullable()
          table.string('bf_fileurl', 255).notNullable().defaultTo('')
          table.string('bf_thumburl', 255).notNullable().defaultTo('')
          table.string('bf_storage', 50).notNullable().defaultTo('')
          table.integer('bf_filesize').notNullable().defaultTo(0)
          table.integer('bf_width').notNullable().defaultTo(0)
          table.specificType('bf_height', 'smallint(6)').notNullable().defaultTo(0)
          table.specificType('bf_type', 'tinyint(4)').notNullable().defaultTo(0)
          table.datetime('bf_datetime').notNullable().defaultTo('1000-01-01 00:00:00')

          table.primary(['bo_table', 'wr_id', 'bf_no'])
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'board_good')
        await dblink.schema.createTable(table_prefix + 'board_good', (table) => {
          table.increments('bg_id').notNullable().primary()
          table.string('bo_table', 20).notNullable().defaultTo('')
          table.integer('wr_id').notNullable().defaultTo(0)
          table.string('mb_id', 20).notNullable().defaultTo('')
          table.string('bg_flag', 255).notNullable().defaultTo('')
          table.datetime('bg_datetime').notNullable().defaultTo('1000-01-01 00:00:00')

          table.unique(['bo_table', 'wr_id', 'mb_id'], 'fkey1')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'board_new')
        await dblink.schema.createTable(table_prefix + 'board_new', (table) => {
          table.increments('bn_id').notNullable().primary()
          table.string('bo_table', 20).notNullable().defaultTo('')
          table.integer('wr_id').notNullable().defaultTo(0)
          table.integer('wr_parent').notNullable().defaultTo(0)
          table.datetime('bn_datetime').notNullable().defaultTo('1000-01-01 00:00:00')
          table.string('mb_id', 20).notNullable().defaultTo('')

          table.index('mb_id', 'mb_id')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'config')
        await dblink.schema.createTable(table_prefix + 'config', (table) => {
          table.string('cf_title', 255).notNullable().defaultTo('')
          table.string('cf_theme', 100).notNullable().defaultTo('')
          table.string('cf_admin', 100).notNullable().defaultTo('')
          table.string('cf_admin_email', 100).notNullable().defaultTo('')
          table.string('cf_admin_email_name', 100).notNullable().defaultTo('')
          table.text('cf_add_script').notNullable()
          table.specificType('cf_use_point', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('cf_point_term').notNullable().defaultTo(0)
          table.specificType('cf_use_copy_log', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_use_email_certify', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('cf_login_point').notNullable().defaultTo(0)
          table.specificType('cf_cut_name', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('cf_nick_modify').notNullable().defaultTo(0)
          table.string('cf_new_skin', 50).notNullable().defaultTo('')
          table.integer('cf_new_rows').notNullable().defaultTo(0)
          table.string('cf_search_skin', 50).notNullable().defaultTo('')
          table.string('cf_connect_skin', 50).notNullable().defaultTo('')
          table.string('cf_faq_skin', 50).notNullable().defaultTo('')
          table.integer('cf_read_point').notNullable().defaultTo(0)
          table.integer('cf_write_point').notNullable().defaultTo(0)
          table.integer('cf_comment_point').notNullable().defaultTo(0)
          table.integer('cf_download_point').notNullable().defaultTo(0)
          table.integer('cf_write_pages').notNullable().defaultTo(0)
          table.integer('cf_mobile_pages').notNullable().defaultTo(0)
          table.string('cf_link_target', 50).notNullable().defaultTo('')
          table.specificType('cf_bbs_rewrite', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('cf_delay_sec').notNullable().defaultTo(0)
          table.text('cf_filter').notNullable()
          table.text('cf_possible_ip').notNullable()
          table.text('cf_intercept_ip').notNullable()
          table.text('cf_analytics').notNullable()
          table.text('cf_add_meta').notNullable()
          table.string('cf_member_skin', 50).notNullable().defaultTo('')
          table.specificType('cf_use_homepage', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_req_homepage', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_use_tel', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_req_tel', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_use_hp', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_req_hp', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_use_addr', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_req_addr', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_use_signature', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_req_signature', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_use_profile', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_req_profile', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_register_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('cf_register_point').notNullable().defaultTo(0)
          table.specificType('cf_icon_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_use_recommend', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('cf_recommend_point').notNullable().defaultTo(0)
          table.integer('cf_leave_day').notNullable().defaultTo(0)
          table.integer('cf_search_part').notNullable().defaultTo(0)
          table.specificType('cf_email_use', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_email_wr_super_admin', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_email_wr_group_admin', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_email_wr_board_admin', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_email_wr_write', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_email_wr_comment_all', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_email_mb_super_admin', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_email_mb_member', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('cf_email_po_super_admin', 'tinyint(4)').notNullable().defaultTo(0)
          table.text('cf_prohibit_id').notNullable()
          table.text('cf_prohibit_email').notNullable()
          table.integer('cf_new_del').notNullable().defaultTo(0)
          table.integer('cf_memo_del').notNullable().defaultTo(0)
          table.integer('cf_visit_del').notNullable().defaultTo(0)
          table.integer('cf_popular_del').notNullable().defaultTo(0)
          table.date('cf_optimize_date').notNullable().defaultTo('1000-01-01')
          table.specificType('cf_use_member_icon', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('cf_member_icon_size').notNullable().defaultTo(0)
          table.integer('cf_member_icon_width').notNullable().defaultTo(0)
          table.integer('cf_member_icon_height').notNullable().defaultTo(0)
          table.integer('cf_member_img_size').notNullable().defaultTo(0)
          table.integer('cf_member_img_width').notNullable().defaultTo(0)
          table.integer('cf_member_img_height').notNullable().defaultTo(0)
          table.integer('cf_login_minutes').notNullable().defaultTo(0)
          table.string('cf_image_extension', 255).notNullable().defaultTo('')
          table.string('cf_flash_extension', 255).notNullable().defaultTo('')
          table.string('cf_movie_extension', 255).notNullable().defaultTo('')
          table.specificType('cf_formmail_is_member', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('cf_page_rows').notNullable().defaultTo(0)
          table.integer('cf_mobile_page_rows').notNullable().defaultTo(0)
          table.string('cf_visit', 255).notNullable().defaultTo('')
          table.integer('cf_max_po_id').notNullable().defaultTo(0)
          table.text('cf_stipulation').notNullable()
          table.text('cf_privacy').notNullable()
          table.integer('cf_open_modify').notNullable().defaultTo(0)
          table.integer('cf_memo_send_point').notNullable().defaultTo(0)
          table.string('cf_mobile_new_skin', 50).notNullable().defaultTo('')
          table.string('cf_mobile_search_skin', 50).notNullable().defaultTo('')
          table.string('cf_mobile_connect_skin', 50).notNullable().defaultTo('')
          table.string('cf_mobile_faq_skin', 50).notNullable().defaultTo('')
          table.string('cf_mobile_member_skin', 50).notNullable().defaultTo('')
          table.string('cf_captcha_mp3', 255).notNullable().defaultTo('')
          table.string('cf_editor', 50).notNullable().defaultTo('')
          table.specificType('cf_cert_use', 'tinyint(4)').notNullable().defaultTo(0)
          table.string('cf_cert_ipin', 255).notNullable().defaultTo('')
          table.string('cf_cert_hp', 255).notNullable().defaultTo('')
          table.string('cf_cert_kcb_cd', 255).notNullable().defaultTo('')
          table.string('cf_cert_kcp_cd', 255).notNullable().defaultTo('')
          table.string('cf_lg_mid', 100).notNullable().defaultTo('')
          table.string('cf_lg_mert_key', 100).notNullable().defaultTo('')
          table.integer('cf_cert_limit').notNullable().defaultTo(0)
          table.specificType('cf_cert_req', 'tinyint(4)').notNullable().defaultTo(0)
          table.string('cf_sms_use', 255).notNullable().defaultTo('')
          table.string('cf_sms_type', 10).notNullable().defaultTo('')
          table.string('cf_icode_id', 255).notNullable().defaultTo('')
          table.string('cf_icode_pw', 255).notNullable().defaultTo('')
          table.string('cf_icode_server_ip', 50).notNullable().defaultTo('')
          table.string('cf_icode_server_port', 50).notNullable().defaultTo('')
          table.string('cf_googl_shorturl_apikey', 50).notNullable().defaultTo('')
          table.specificType('cf_social_login_use', 'tinyint(4)').notNullable().defaultTo(0)
          table.string('cf_social_servicelist', 255).notNullable().defaultTo('')
          table.string('cf_payco_clientid', 100).notNullable().defaultTo('')
          table.string('cf_payco_secret', 100).notNullable().defaultTo('')
          table.string('cf_facebook_appid', 100).notNullable()
          table.string('cf_facebook_secret', 100).notNullable()
          table.string('cf_twitter_key', 100).notNullable()
          table.string('cf_twitter_secret', 100).notNullable()
          table.string('cf_google_clientid', 100).notNullable().defaultTo('')
          table.string('cf_google_secret', 100).notNullable().defaultTo('')
          table.string('cf_naver_clientid', 100).notNullable().defaultTo('')
          table.string('cf_naver_secret', 100).notNullable().defaultTo('')
          table.string('cf_kakao_rest_key', 100).notNullable().defaultTo('')
          table.string('cf_kakao_client_secret', 100).notNullable().defaultTo('')
          table.string('cf_kakao_js_apikey', 100).notNullable().defaultTo('')
          table.string('cf_captcha', 100).notNullable().defaultTo('')
          table.string('cf_recaptcha_site_key', 100).notNullable().defaultTo('')
          table.string('cf_recaptcha_secret_key', 100).notNullable().defaultTo('')
          table.string('cf_1_subj', 255).notNullable().defaultTo('')
          table.string('cf_2_subj', 255).notNullable().defaultTo('')
          table.string('cf_3_subj', 255).notNullable().defaultTo('')
          table.string('cf_4_subj', 255).notNullable().defaultTo('')
          table.string('cf_5_subj', 255).notNullable().defaultTo('')
          table.string('cf_6_subj', 255).notNullable().defaultTo('')
          table.string('cf_7_subj', 255).notNullable().defaultTo('')
          table.string('cf_8_subj', 255).notNullable().defaultTo('')
          table.string('cf_9_subj', 255).notNullable().defaultTo('')
          table.string('cf_10_subj', 255).notNullable().defaultTo('')
          table.string('cf_1', 255).notNullable().defaultTo('')
          table.string('cf_2', 255).notNullable().defaultTo('')
          table.string('cf_3', 255).notNullable().defaultTo('')
          table.string('cf_4', 255).notNullable().defaultTo('')
          table.string('cf_5', 255).notNullable().defaultTo('')
          table.string('cf_6', 255).notNullable().defaultTo('')
          table.string('cf_7', 255).notNullable().defaultTo('')
          table.string('cf_8', 255).notNullable().defaultTo('')
          table.string('cf_9', 255).notNullable().defaultTo('')
          table.string('cf_10', 255).notNullable().defaultTo('')

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'cert_history')
        await dblink.schema.createTable(table_prefix + 'cert_history', (table) => {
          table.increments('cr_id').notNullable().primary()
          table.string('mb_id', 20).notNullable().defaultTo('')
          table.string('cr_company', 255).notNullable().defaultTo('')
          table.string('cr_method', 255).notNullable().defaultTo('')
          table.string('cr_ip', 255).notNullable().defaultTo('')
          table.date('cr_date').notNullable().defaultTo('1000-01-01')
          table.time('cr_time').notNullable().defaultTo('00:00:00')

          table.index('mb_id', 'mb_id')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'group')
        await dblink.schema.createTable(table_prefix + 'group', (table) => {
          table.string('gr_id', 10).notNullable().defaultTo('').primary()
          table.string('gr_subject', 255).notNullable().defaultTo('')
          table.enu('gr_device', ['both', 'pc', 'mobile']).notNullable().defaultTo('both')
          table.string('gr_admin', 255).notNullable().defaultTo('')
          table.specificType('gr_use_access', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('gr_order').notNullable().defaultTo(0)
          table.string('gr_1_subj', 255).notNullable().defaultTo('')
          table.string('gr_2_subj', 255).notNullable().defaultTo('')
          table.string('gr_3_subj', 255).notNullable().defaultTo('')
          table.string('gr_4_subj', 255).notNullable().defaultTo('')
          table.string('gr_5_subj', 255).notNullable().defaultTo('')
          table.string('gr_6_subj', 255).notNullable().defaultTo('')
          table.string('gr_7_subj', 255).notNullable().defaultTo('')
          table.string('gr_8_subj', 255).notNullable().defaultTo('')
          table.string('gr_9_subj', 255).notNullable().defaultTo('')
          table.string('gr_10_subj', 255).notNullable().defaultTo('')
          table.string('gr_1', 255).notNullable().defaultTo('')
          table.string('gr_2', 255).notNullable().defaultTo('')
          table.string('gr_3', 255).notNullable().defaultTo('')
          table.string('gr_4', 255).notNullable().defaultTo('')
          table.string('gr_5', 255).notNullable().defaultTo('')
          table.string('gr_6', 255).notNullable().defaultTo('')
          table.string('gr_7', 255).notNullable().defaultTo('')
          table.string('gr_8', 255).notNullable().defaultTo('')
          table.string('gr_9', 255).notNullable().defaultTo('')
          table.string('gr_10', 255).notNullable().defaultTo('')

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'group_member')
        await dblink.schema.createTable(table_prefix + 'group_member', (table) => {
          table.increments('gm_id').notNullable().primary()
          table.string('gr_id', 255).notNullable().defaultTo('')
          table.string('mb_id', 20).notNullable().defaultTo('')
          table.datetime('gm_datetime').notNullable().defaultTo('1000-01-01 00:00:00')

          table.index('gr_id', 'gr_id')
          table.index('mb_id', 'mb_id')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'login')
        await dblink.schema.createTable(table_prefix + 'login', (table) => {
          table.string('lo_ip', 100).notNullable().defaultTo('').primary()
          table.string('mb_id', 20).notNullable().defaultTo('')
          table.datetime('lo_datetime').notNullable().defaultTo('1000-01-01 00:00:00')
          table.text('lo_location').notNullable()
          table.text('lo_url').notNullable()

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'mail')
        await dblink.schema.createTable(table_prefix + 'mail', (table) => {
          table.increments('ma_id').notNullable().primary()
          table.string('ma_subject', 255).notNullable().defaultTo('')
          table.text('ma_content', 'mediumtext').notNullable()
          table.datetime('ma_time').notNullable().defaultTo('1000-01-01 00:00:00')
          table.string('ma_ip', 255).notNullable().defaultTo('')
          table.text('ma_last_option').notNullable()

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'member')
        await dblink.schema.createTable(table_prefix + 'member', (table) => {
          table.increments('mb_no').notNullable().primary()
          table.string('mb_id', 20).notNullable().defaultTo('')
          table.string('mb_password', 255).notNullable().defaultTo('')
          table.string('mb_name', 255).notNullable().defaultTo('')
          table.string('mb_nick', 255).notNullable().defaultTo('')
          table.date('mb_nick_date').notNullable().defaultTo('1000-01-01')
          table.string('mb_email', 255).notNullable().defaultTo('')
          table.string('mb_homepage', 255).notNullable().defaultTo('')
          table.specificType('mb_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('mb_sex', 'char(1)').notNullable().defaultTo('')
          table.string('mb_birth', 255).notNullable().defaultTo('')
          table.string('mb_tel', 255).notNullable().defaultTo('')
          table.string('mb_hp', 255).notNullable().defaultTo('')
          table.string('mb_certify', 20).notNullable().defaultTo('')
          table.specificType('mb_adult', 'tinyint(4)').notNullable().defaultTo(0)
          table.string('mb_dupinfo', 255).notNullable().defaultTo('')
          table.specificType('mb_zip1', 'char(3)').notNullable().defaultTo('')
          table.specificType('mb_zip2', 'char(3)').notNullable().defaultTo('')
          table.string('mb_addr1', 255).notNullable().defaultTo('')
          table.string('mb_addr2', 255).notNullable().defaultTo('')
          table.string('mb_addr3', 255).notNullable().defaultTo('')
          table.string('mb_addr_jibeon', 255).notNullable().defaultTo('')
          table.text('mb_signature').notNullable()
          table.string('mb_recommend', 255).notNullable().defaultTo('')
          table.integer('mb_point').notNullable().defaultTo(0)
          table.datetime('mb_today_login').notNullable().defaultTo('1000-01-01 00:00:00')
          table.string('mb_login_ip', 255).notNullable().defaultTo('')
          table.datetime('mb_datetime').notNullable().defaultTo('1000-01-01 00:00:00')
          table.string('mb_ip', 255).notNullable().defaultTo('')
          table.string('mb_leave_date', 8).notNullable().defaultTo('')
          table.string('mb_intercept_date', 8).notNullable().defaultTo('')
          table.datetime('mb_email_certify').notNullable().defaultTo('1000-01-01 00:00:00')
          table.string('mb_email_certify2', 255).notNullable().defaultTo('')
          table.text('mb_memo').notNullable()
          table.string('mb_lost_certify', 255).notNullable().defaultTo('')
          table.specificType('mb_mailling', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('mb_sms', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('mb_open', 'tinyint(4)').notNullable().defaultTo(0)
          table.date('mb_open_date').notNullable().defaultTo('1000-01-01')
          table.text('mb_profile').notNullable()
          table.string('mb_memo_call', 255).notNullable().defaultTo('')
          table.integer('mb_memo_cnt').notNullable().defaultTo(0)
          table.integer('mb_scrap_cnt').notNullable().defaultTo(0)
          table.string('mb_1', 255).notNullable().defaultTo('')
          table.string('mb_2', 255).notNullable().defaultTo('')
          table.string('mb_3', 255).notNullable().defaultTo('')
          table.string('mb_4', 255).notNullable().defaultTo('')
          table.string('mb_5', 255).notNullable().defaultTo('')
          table.string('mb_6', 255).notNullable().defaultTo('')
          table.string('mb_7', 255).notNullable().defaultTo('')
          table.string('mb_8', 255).notNullable().defaultTo('')
          table.string('mb_9', 255).notNullable().defaultTo('')
          table.string('mb_10', 255).notNullable().defaultTo('')

          table.unique('mb_id', 'mb_id')
          table.index('mb_today_login', 'mb_today_login')
          table.index('mb_datetime', 'mb_datetime')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'memo')
        await dblink.schema.createTable(table_prefix + 'memo', (table) => {
          table.increments('me_id').notNullable().primary()
          table.string('me_recv_mb_id', 20).notNullable().defaultTo('')
          table.string('me_send_mb_id', 20).notNullable().defaultTo('')
          table.datetime('me_send_datetime').notNullable().defaultTo('1000-01-01 00:00:00')
          table.datetime('me_read_datetime').notNullable().defaultTo('1000-01-01 00:00:00')
          table.text('me_memo').notNullable()
          table.integer('me_send_id').notNullable().defaultTo(0)
          table.enu('me_type', ['send', 'recv']).notNullable().defaultTo('recv')
          table.string('me_send_ip', 100).notNullable().defaultTo('')

          table.index('me_recv_mb_id', 'me_recv_mb_id')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'point')
        await dblink.schema.createTable(table_prefix + 'point', (table) => {
          table.integer('po_id').notNullable().primary()
          table.string('mb_id', 20).notNullable().defaultTo('')
          table.datetime('po_datetime').notNullable().defaultTo('1000-01-01 00:00:00')
          table.string('po_content', 255).notNullable().defaultTo('')
          table.integer('po_point').notNullable().defaultTo(0)
          table.integer('po_use_point').notNullable().defaultTo(0)
          table.specificType('po_expired', 'tinyint(4)').notNullable().defaultTo(0)
          table.date('po_expire_date').notNullable().defaultTo('1000-01-01')
          table.integer('po_mb_point').notNullable().defaultTo(0)
          table.string('po_rel_table', 20).notNullable().defaultTo('')
          table.string('po_rel_id', 20).notNullable().defaultTo('')
          table.string('po_rel_action', 100).notNullable().defaultTo('')

          table.index(['mb_id', 'po_rel_table', 'po_rel_id', 'po_rel_action'], 'index1')
          table.index('po_expire_date', 'index2')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'poll')
        await dblink.schema.createTable(table_prefix + 'poll', (table) => {
          table.increments('po_id').notNullable().primary()
          table.string('po_subject', 255).notNullable().defaultTo('')
          table.string('po_poll1', 255).notNullable().defaultTo('')
          table.string('po_poll2', 255).notNullable().defaultTo('')
          table.string('po_poll3', 255).notNullable().defaultTo('')
          table.string('po_poll4', 255).notNullable().defaultTo('')
          table.string('po_poll5', 255).notNullable().defaultTo('')
          table.string('po_poll6', 255).notNullable().defaultTo('')
          table.string('po_poll7', 255).notNullable().defaultTo('')
          table.string('po_poll8', 255).notNullable().defaultTo('')
          table.string('po_poll9', 255).notNullable().defaultTo('')
          table.integer('po_cnt1').notNullable().defaultTo(0)
          table.integer('po_cnt2').notNullable().defaultTo(0)
          table.integer('po_cnt3').notNullable().defaultTo(0)
          table.integer('po_cnt4').notNullable().defaultTo(0)
          table.integer('po_cnt5').notNullable().defaultTo(0)
          table.integer('po_cnt6').notNullable().defaultTo(0)
          table.integer('po_cnt7').notNullable().defaultTo(0)
          table.integer('po_cnt8').notNullable().defaultTo(0)
          table.integer('po_cnt9').notNullable().defaultTo(0)
          table.string('po_etc', 255).notNullable().defaultTo('')
          table.specificType('po_level', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('po_point').notNullable().defaultTo(0)
          table.date('po_date').notNullable().defaultTo('1000-01-01')
          table.text('po_ips', 'mediumtext').notNullable()
          table.text('mb_ids').notNullable()

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'poll_etc')
        await dblink.schema.createTable(table_prefix + 'poll_etc', (table) => {
          table.integer('pc_id').notNullable().defaultTo(0).primary()
          table.integer('po_id').notNullable().defaultTo(0)
          table.string('mb_id', 20).notNullable().defaultTo('')
          table.string('pc_name', 255).notNullable().defaultTo('')
          table.string('pc_idea', 255).notNullable().defaultTo('')
          table.datetime('pc_datetime').notNullable().defaultTo('1000-01-01 00:00:00')

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'popular')
        await dblink.schema.createTable(table_prefix + 'popular', (table) => {
          table.increments('pp_id').notNullable().primary()
          table.string('pp_word', 50).notNullable().defaultTo('')
          table.date('pp_date').notNullable().defaultTo('1000-01-01')
          table.string('pp_ip', 50).notNullable().defaultTo('')

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'scrap')
        await dblink.schema.createTable(table_prefix + 'scrap', (table) => {
          table.increments('ms_id').notNullable().primary()
          table.string('mb_id', 20).notNullable().defaultTo('')
          table.string('bo_table', 20).notNullable().defaultTo('')
          table.string('wr_id', 15).notNullable().defaultTo('')
          table.datetime('ms_datetime').notNullable().defaultTo('1000-01-01 00:00:00')

          table.index('mb_id', 'mb_id')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        dblink.schema.dropTableIfExists(table_prefix + 'visit')
        dblink.schema.createTable(table_prefix + 'visit', (table) => {
          table.integer('vi_id').notNullable().defaultTo(0).primary()
          table.string('vi_ip', 100).notNullable().defaultTo('')
          table.date('vi_date').notNullable().defaultTo('1000-01-01')
          table.time('vi_time').notNullable().defaultTo('00:00:00')
          table.text('vi_referer').notNullable()
          table.string('vi_agent', 200).notNullable().defaultTo('')
          table.string('vi_browser', 255).notNullable().defaultTo('')
          table.string('vi_os', 255).notNullable().defaultTo('')
          table.string('vi_device', 255).notNullable().defaultTo('')

          table.unique(['vi_ip', 'vi_date'], 'index1')
          table.index('vi_date', 'index2')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'visit_sum')
        await dblink.schema.createTable(table_prefix + 'visit_sum', (table) => {
          table.date('vs_date').notNullable().defaultTo('1000-01-01').primary()
          table.integer('vs_count').notNullable().defaultTo(0)

          table.index('vs_count', 'index1')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'uniqid')
        await dblink.schema.createTable(table_prefix + 'uniqid', (table) => {
          table.bigInteger('uq_id').unsigned().notNullable().primary()
          table.string('uq_ip', 255).notNullable()

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'autosave')
        await dblink.schema.createTable(table_prefix + 'autosave', (table) => {
          table.increments('as_id').notNullable().primary()
          table.string('mb_id', 20).notNullable()
          table.bigInteger('as_uid').notNullable()
          table.string('as_subject', 255).notNullable()
          table.text('as_content').notNullable()
          table.datetime('as_datetime').notNullable()

          table.unique('as_uid', 'as_uid')
          table.index('mb_id', 'mb_id')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'qa_config')
        await dblink.schema.createTable(table_prefix + 'qa_config', (table) => {
          table.string('qa_title', 255).notNullable().defaultTo('')
          table.string('qa_category', 255).notNullable().defaultTo('')
          table.string('qa_skin', 255).notNullable().defaultTo('')
          table.string('qa_mobile_skin', 255).notNullable().defaultTo('')
          table.specificType('qa_use_email', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('qa_req_email', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('qa_use_hp', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('qa_req_hp', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('qa_use_sms', 'tinyint(4)').notNullable().defaultTo(0)
          table.string('qa_send_number', 255).notNullable().defaultTo('0')
          table.string('qa_admin_hp', 255).notNullable().defaultTo('')
          table.string('qa_admin_email', 255).notNullable().defaultTo('')
          table.specificType('qa_use_editor', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('qa_subject_len').notNullable().defaultTo(0)
          table.integer('qa_mobile_subject_len').notNullable().defaultTo(0)
          table.integer('qa_page_rows').notNullable().defaultTo(0)
          table.integer('qa_mobile_page_rows').notNullable().defaultTo(0)
          table.integer('qa_image_width').notNullable().defaultTo(0)
          table.integer('qa_upload_size').notNullable().defaultTo(0)
          table.text('qa_insert_content').notNullable()
          table.string('qa_include_head', 255).notNullable().defaultTo('')
          table.string('qa_include_tail', 255).notNullable().defaultTo('')
          table.text('qa_content_head').notNullable()
          table.text('qa_content_tail').notNullable()
          table.text('qa_mobile_content_head').notNullable()
          table.text('qa_mobile_content_tail').notNullable()
          table.string('qa_1_subj', 255).notNullable().defaultTo('')
          table.string('qa_2_subj', 255).notNullable().defaultTo('')
          table.string('qa_3_subj', 255).notNullable().defaultTo('')
          table.string('qa_4_subj', 255).notNullable().defaultTo('')
          table.string('qa_5_subj', 255).notNullable().defaultTo('')
          table.string('qa_1', 255).notNullable().defaultTo('')
          table.string('qa_2', 255).notNullable().defaultTo('')
          table.string('qa_3', 255).notNullable().defaultTo('')
          table.string('qa_4', 255).notNullable().defaultTo('')
          table.string('qa_5', 255).notNullable().defaultTo('')

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'qa_content')
        await dblink.schema.createTable(table_prefix + 'qa_content', (table) => {
          table.increments('qa_id').notNullable().primary()
          table.integer('qa_num').notNullable().defaultTo(0)
          table.integer('qa_parent').notNullable().defaultTo(0)
          table.integer('qa_related').notNullable().defaultTo(0)
          table.string('mb_id', 20).notNullable().defaultTo('')
          table.string('qa_name', 255).notNullable().defaultTo('')
          table.string('qa_email', 255).notNullable().defaultTo('')
          table.string('qa_hp', 255).notNullable().defaultTo('')
          table.specificType('qa_type', 'tinyint(4)').notNullable().defaultTo(0)
          table.string('qa_category', 255).notNullable().defaultTo('')
          table.specificType('qa_email_recv', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('qa_sms_recv', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('qa_html', 'tinyint(4)').notNullable().defaultTo(0)
          table.string('qa_subject', 255).notNullable().defaultTo('')
          table.text('qa_content').notNullable()
          table.specificType('qa_status', 'tinyint(4)').notNullable().defaultTo(0)
          table.string('qa_file1', 255).notNullable().defaultTo('')
          table.string('qa_source1', 255).notNullable().defaultTo('')
          table.string('qa_file2', 255).notNullable().defaultTo('')
          table.string('qa_source2', 255).notNullable().defaultTo('')
          table.string('qa_ip', 255).notNullable().defaultTo('')
          table.datetime('qa_datetime').notNullable().defaultTo('1000-01-01 00:00:00')
          table.string('qa_1', 255).notNullable().defaultTo('')
          table.string('qa_2', 255).notNullable().defaultTo('')
          table.string('qa_3', 255).notNullable().defaultTo('')
          table.string('qa_4', 255).notNullable().defaultTo('')
          table.string('qa_5', 255).notNullable().defaultTo('')

          table.index(['qa_num', 'qa_parent'], 'qa_num_parent')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'content')
        await dblink.schema.createTable(table_prefix + 'content', (table) => {
          table.string('co_id', 20).notNullable().defaultTo('')
          table.specificType('co_html', 'tinyint(4)').notNullable().defaultTo(0)
          table.string('co_subject', 255).notNullable().defaultTo('')
          table.text('co_content', 'longtext').notNullable()
          table.string('co_seo_title', 255).notNullable().defaultTo('')
          table.text('co_mobile_content', 'longtext').notNullable()
          table.string('co_skin', 255).notNullable().defaultTo('')
          table.string('co_mobile_skin', 255).notNullable().defaultTo('')
          table.specificType('co_tag_filter_use', 'tinyint(4)').notNullable().defaultTo(0)
          table.integer('co_hit').notNullable().defaultTo(0)
          table.string('co_include_head', 255).notNullable().defaultTo('')
          table.string('co_include_tail', 255).notNullable().defaultTo('')

          table.index('co_seo_title', 'co_seo_title')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'faq')
        await dblink.schema.createTable(table_prefix + 'faq', (table) => {
          table.increments('fa_id').notNullable().primary()
          table.integer('fm_id').notNullable().defaultTo(0)
          table.text('fa_subject').notNullable()
          table.text('fa_content').notNullable()
          table.integer('fa_order').notNullable().defaultTo(0)

          table.index('fm_id', 'fm_id')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'faq_master')
        await dblink.schema.createTable(table_prefix + 'faq_master', (table) => {
          table.increments('fm_id').notNullable().primary()
          table.string('fm_subject', 255).notNullable().defaultTo('')
          table.text('fm_head_html').notNullable()
          table.text('fm_tail_html').notNullable()
          table.text('fm_mobile_head_html').notNullable()
          table.text('fm_mobile_tail_html').notNullable()
          table.integer('fm_order').notNullable().defaultTo(0)

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'member_social_profiles')
        await dblink.schema.createTable(table_prefix + 'member_social_profiles', (table) => {
          table.increments('mp_no').notNullable()
          table.string('mb_id', 255).notNullable().defaultTo('')
          table.string('provider', 50).notNullable().defaultTo('')
          table.string('object_sha', 45).notNullable().defaultTo('')
          table.string('identifier', 255).notNullable().defaultTo('')
          table.string('profileurl', 255).notNullable().defaultTo('')
          table.string('photourl', 255).notNullable().defaultTo('')
          table.string('displayname', 150).notNullable().defaultTo('')
          table.string('description', 255).notNullable().defaultTo('')
          table.datetime('mp_register_day').notNullable().defaultTo('1000-01-01 00:00:00')
          table.datetime('mp_latest_day').notNullable().defaultTo('1000-01-01 00:00:00')

          table.unique('mp_no', 'mp_no')
          table.index('mb_id', 'mb_id')
          table.index('provider', 'provider')
          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'new_win')
        await dblink.schema.createTable(table_prefix + 'new_win', (table) => {
          table.increments('nw_id').notNullable().primary()
          table.string('nw_device', 10).notNullable().defaultTo('')
          table.datetime('nw_begin_time').notNullable().defaultTo('1000-01-01 00:00:00')
          table.datetime('nw_end_time').notNullable().defaultTo('1000-01-01 00:00:00')
          table.integer('nw_disable_hours').notNullable().defaultTo(0)
          table.integer('nw_left').notNullable().defaultTo(0)
          table.integer('nw_top').notNullable().defaultTo(0)
          table.integer('nw_height').notNullable().defaultTo(0)
          table.integer('nw_width').notNullable().defaultTo(0)
          table.text('nw_subject').notNullable()
          table.text('nw_content').notNullable()
          table.specificType('nw_content_html', 'tinyint(4)').notNullable().defaultTo(0)

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await dblink.schema.dropTableIfExists(table_prefix + 'menu')
        await dblink.schema.createTable(table_prefix + 'menu', (table) => {
          table.increments('me_id').notNullable().primary()
          table.string('me_code', 255).notNullable().defaultTo('')
          table.string('me_name', 255).notNullable().defaultTo('')
          table.string('me_link', 255).notNullable().defaultTo('')
          table.string('me_target', 255).notNullable().defaultTo('')
          table.integer('me_order').notNullable().defaultTo(0)
          table.specificType('me_use', 'tinyint(4)').notNullable().defaultTo(0)
          table.specificType('me_mobile_use', 'tinyint(4)').notNullable().defaultTo(0)

          table.engine('MyISAM')
          table.charset('utf8')
        })

        await trx.commit()
      } catch (err) {
        await trx.rollback(err)
        returnData.installStep = 0
        throw err
      }


    })

    // 테이블 생성 ------------------------------------

    let read_point = 0
    let write_point = 0
    let comment_point = 0
    let download_point = 0

    //-------------------------------------------------------------------------------------------------
    // config 테이블 설정
    await dblink.transaction(async (trx) => {
      try {
        await dblink.from(table_prefix + 'config').insert({
          cf_title: config.G5_VERSION,
          cf_theme: 'basic',
          cf_admin: admin_id,
          cf_admin_email: admin_email,
          cf_admin_email_name: config.G5_VERSION,
          cf_use_point: 1,
          cf_use_copy_log: 1,
          cf_login_point: 100,
          cf_memo_send_point: 500,
          cf_cut_name: 15,
          cf_nick_modify: 60,
          cf_new_skin: 'basic',
          cf_new_rows: '15',
          cf_search_skin: 'basic',
          cf_connect_skin: 'basic',
          cf_read_point: read_point,
          cf_write_point: write_point,
          cf_comment_point: comment_point,
          cf_download_point: download_point,
          cf_write_pages: 10,
          cf_mobile_pages: 5,
          cf_link_target: '_blank',
          cf_delay_sec: '30',
          cf_filter: '18아,18놈,18새끼,18뇬,18노,18것,18넘,개년,개놈,개뇬,개새,개색끼,개세끼,개세이,개쉐이,개쉑,개쉽,개시키,개자식,개좆,게색기,게색끼,광뇬,뇬,눈깔,뉘미럴,니귀미,니기미,니미,도촬,되질래,뒈져라,뒈진다,디져라,디진다,디질래,병쉰,병신,뻐큐,뻑큐,뽁큐,삐리넷,새꺄,쉬발,쉬밸,쉬팔,쉽알,스패킹,스팽,시벌,시부랄,시부럴,시부리,시불,시브랄,시팍,시팔,시펄,실밸,십8,십쌔,십창,싶알,쌉년,썅놈,쌔끼,쌩쑈,썅,써벌,썩을년,쎄꺄,쎄엑,쓰바,쓰발,쓰벌,쓰팔,씨8,씨댕,씨바,씨발,씨뱅,씨봉알,씨부랄,씨부럴,씨부렁,씨부리,씨불,씨브랄,씨빠,씨빨,씨뽀랄,씨팍,씨팔,씨펄,씹,아가리,아갈이,엄창,접년,잡놈,재랄,저주글,조까,조빠,조쟁이,조지냐,조진다,조질래,존나,존니,좀물,좁년,좃,좆,좇,쥐랄,쥐롤,쥬디,지랄,지럴,지롤,지미랄,쫍빱,凸,퍽큐,뻑큐,빠큐,ㅅㅂㄹㅁ',
          cf_possible_ip: '',
          cf_intercept_ip: '',
          cf_analytics: '',
          cf_member_skin: 'basic',
          cf_mobile_new_skin: 'basic',
          cf_mobile_search_skin: 'basic',
          cf_mobile_connect_skin: 'basic',
          cf_mobile_member_skin: 'basic',
          cf_faq_skin: 'basic',
          cf_mobile_faq_skin: 'basic',
          cf_editor: 'smarteditor2',
          cf_captcha_mp3: 'basic',
          cf_register_level: 2,
          cf_register_point: 1000,
          cf_icon_level: 2,
          cf_leave_day: 30,
          cf_search_part: '10000',
          cf_email_use: '1',
          cf_prohibit_id: 'admin,administrator,관리자,운영자,어드민,주인장,webmaster,웹마스터,sysop,시삽,시샵,manager,매니저,메니저,root,루트,su,guest,방문객',
          cf_prohibit_email: '',
          cf_new_del: 30,
          cf_memo_del: 180,
          cf_visit_del: 180,
          cf_popular_del: 180,
          cf_use_member_icon: 2,
          cf_member_icon_size: 5000,
          cf_member_icon_width: 22,
          cf_member_icon_height: 22,
          cf_member_img_size: 50000,
          cf_member_img_width: 60,
          cf_member_img_height: 60,
          cf_login_minutes: 10,
          cf_image_extension: 'gif|jpg|jpeg|png',
          cf_flash_extension: 'swf',
          cf_movie_extension: 'asx|asf|wmv|wma|mpg|mpeg|mov|avi|mp3',
          cf_formmail_is_member: 1,
          cf_page_rows: 15,
          cf_mobile_page_rows: 15,
          cf_cert_limit: 2,
          cf_stipulation: '해당 홈페이지에 맞는 회원가입약관을 입력합니다.',
          cf_privacy: '해당 홈페이지에 맞는 개인정보처리방침을 입력합니다.',

          cf_add_script: '',
          cf_add_meta: '',
          cf_facebook_appid: '',
          cf_facebook_secret: '',
          cf_twitter_key: '',
          cf_twitter_secret: ''
        })

        // 1:1문의 설정
        await dblink.from(table_prefix + 'qa_config').insert({
          qa_title: '1:1문의',
          qa_category: '회원|포인트',
          qa_skin: 'basic',
          qa_mobile_skin: 'basic',
          qa_use_email: 1,
          qa_req_email: 0,
          qa_use_hp: 1,
          qa_req_hp: 0,
          qa_use_editor: 1,
          qa_subject_len: 60,
          qa_mobile_subject_len: 30,
          qa_page_rows: 15,
          qa_mobile_page_rows: 15,
          qa_image_width: 600,
          qa_upload_size: 1048576,
          qa_insert_content: '',

          qa_content_head: '',
          qa_content_tail: '',
          qa_mobile_content_head: '',
          qa_mobile_content_tail: ''
        })

        // 관리자 회원가입
        await dblink.from(table_prefix + 'member').insert({
          mb_id: admin_id,
          mb_password: await commonLib.get_encrypt_string(admin_pass, dblink),
          mb_name: admin_name,
          mb_nick: admin_name,
          mb_email: admin_email,
          mb_level: 10,
          mb_mailling: 1,
          mb_open: 1,
          mb_email_certify: config.G5_TIME_YMDHIS,
          mb_datetime: config.G5_TIME_YMDHIS,
          mb_ip: req.ip,

          mb_signature: '',
          mb_memo: '',
          mb_profile: ''
        })

        // 내용관리 생성
        dblink.from(table_prefix + 'content').insert({
          co_id: 'company',
          co_html: 1,
          co_subject: '회사소개',
          co_seo_title: generate_seo_title('회사소개'),
          co_content: '<p align=center><b>회사소개에 대한 내용을 입력하십시오.</b></p>'
        })

        await trx.commit()
      } catch (err) {
        await trx.rollback(err)
        returnData.installStep = 1
        throw err
      }
    })
  } catch (err) {
    returnData._status = 'InstallError'
    returnData.err = err
    return returnData
  }

  returnData._status = 'OK'
  return returnData
}

module.exports = run
