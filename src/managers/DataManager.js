module.exports.getConfig = async function getConfig(session, isCache = false) {
  // TODO cache
  
  const cache = await session.knex(session.server.dbconfig.configTable).select()
  return cache[0]
}

module.exports.getMenuDB = async function getMenuDB(session, useMobile = false, isCache = false) {
  let cache = []

  const result = await session.knex(session.server.dbconfig.menuTable)
    .select()
    .where(useMobile ? 'me_mobile_use' : 'me_use', true)
    .andWhere(session.knex.raw('length(me_code) = 2'))
    .orderBy('me_order', 'me_id')

  for(let i = 0; i < result.length; i++) {
    const row = result[i]
    row.ori_me_link = row.link
    // TODO $row['me_link'] = short_url_clean($row['me_link']);
    cache[i] = row

    // TODO later
  }
}
