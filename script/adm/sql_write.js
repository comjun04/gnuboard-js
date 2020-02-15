async function query(dblink, tablePrefix, tableName) {
  await dblink.schema.dropTableIfExists(tablePrefix + 'write_' + tableName)
  await dblink.schema.createTable(tablePrefix + 'write_' + tableName, (table) => {
    table.increments('wr_id').notNullable().primary()
    table.integer('wr_num').notNullable().defaultTo(0)
    table.string('wr_reply', 10).notNullable()
    table.integer('wr_parent').notNullable().defaultTo(0)
    table.specificType('wr_is_comment', 'tinyint(4)').notNullable().defaultTo(0)
    table.integer('wr_comment').notNullable().defaultTo(0)
    table.string('wr_comment_reply', 5).notNullable()
    table.string('ca_name', 255).notNullable()
    table.specificType('wr_option', "set('html1', 'html2', 'secret', 'mail')")
    table.string('wr_subject', 255).notNullable()
    table.text('wr_content').notNullable()
    table.string('wr_seo_title', 255).notNullable().defaultTo('')
    table.text('wr_link1').notNullable()
    table.text('wr_link2').notNullable()
    table.integer('wr_link1_hit').notNullable().defaultTo(0)
    table.integer('wr_link2_hit').notNullable().defaultTo(0)
    table.integer('wr_hit').notNullable().defaultTo(0)
    table.integer('wr_good').notNullable().defaultTo(0)
    table.integer('wr_nogood').notNullable().defaultTo(0)
    table.string('mb_id', 20).notNullable()
    table.string('wr_password', 255).notNullable()
    table.string('wr_name', 255).notNullable()
    table.string('wr_email', 255).notNullable()
    table.string('wr_homepage', 255).notNullable()
    table.datetime('wr_datetime').notNullable().defaultTo('1000-01-01 00:00:00')
    table.specificType('wr_file', 'tinyint(4)').notNullable().defaultTo(0)
    table.string('wr_last', 19).notNullable()
    table.string('wr_ip', 255).notNullable()
    table.string('wr_facebook_user', 255).notNullable()
    table.string('wr_twitter_user', 255).notNullable()
    table.string('wr_1', 255).notNullable()
    table.string('wr_2', 255).notNullable()
    table.string('wr_3', 255).notNullable()
    table.string('wr_4', 255).notNullable()
    table.string('wr_5', 255).notNullable()
    table.string('wr_6', 255).notNullable()
    table.string('wr_7', 255).notNullable()
    table.string('wr_8', 255).notNullable()
    table.string('wr_9', 255).notNullable()
    table.string('wr_10', 255).notNullable()

    table.index('wr_seo_title', 'wr_seo_title')
    table.index(['wr_num', 'wr_reply', 'wr_parent'], 'wr_num_reply_parent')
    table.index(['wr_is_comment', 'wr_id'], 'wr_is_comment')
    table.engine('MyISAM')
    table.charset('utf8')
  })
}

module.exports = query
