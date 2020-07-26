const path = require('path')
const express = require('express')
const router = express.Router()

const Session = require('../models/session')

const headRun = require('../script/head')

router.get('/', async (req, res) => {
  const session = new Session(req.server)
  await session.loadConfig()

  // TODO 테마
  
  // TODO 모바일

  // TODO head
  const head = await headRun(req, res, session)
  
  // TODO 최신글 불러오기
  session.latestSkinPath = path.join('skin', 'latest')
  session.latestArticle = {
    skin: session.latestSkinPath,
    list: []
  }

  const boards = session.server.boards
  const freeBoardLatest = await boards.get('free').getLatestArticles()
  session.latestArticle.list.push({
    board: boards.get('free'),
    type: 'pic_list',
    articles: freeBoardLatest
  })

  const qaBoardLatest = await boards.get('qa').getLatestArticles()
  session.latestArticle.list.push({
    board: boards.get('qa'),
    type: 'pic_list',
    articles: qaBoardLatest
  })

  const noticeBoardLatest = await boards.get('notice').getLatestArticles()
  session.latestArticle.list.push({
    board: boards.get('notice'),
    type: 'pic_list',
    articles: noticeBoardLatest
  })

  const galleryBoardLatest = await boards.get('gallery').getLatestArticles()
  session.latestArticle.list.push({
    board: boards.get('gallery'),
    type: 'pic_block',
    articles: galleryBoardLatest
  })

console.log(session.latestArticle)
  res.render('index', { session })
})

module.exports = router
