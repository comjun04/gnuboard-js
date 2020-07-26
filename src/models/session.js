const debug = require('debug')('gnuboard-js:session')

const dataManager = require('../managers/DataManager')
const ResourceManager = require('../managers/ResourceManager')

/**
 * 기존의 common.php 역할을 담당
 * common.php를 실행하는 모든 페이지 접속 시 생성됨
 */
class Session {
  constructor(server) {
    this.server = server
    this.knex = server.knex
    this.resourceManager = new ResourceManager()
  }

  async loadConfig(knex) {
    this.config = await dataManager.getConfig(this, false)
  }
}

module.exports = Session
