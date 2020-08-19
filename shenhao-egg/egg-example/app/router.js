'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
// eslint-disable-next-line no-undef
module.exports = (app) => {
  const { router, controller } = app
  router.get('/', controller.home.index)
  router.get('/custom', controller.web.custonIndex)

  // 上传文件
  router.post('/api/file', controller.file.create)

  // 获取文件
  router.get('/api/file/:pmCode', controller.file.download)

  // 编辑和新增视频
  router.post('/api/setVideoDetail', controller.web.setVideoDetail)

  // 获取列表
  router.get('/api/getVideoList', controller.web.getVideoList)

  // 获取视屏详情
  router.get('/api/getVideoDetail', controller.web.getVideoDetail)

  // 删除视频
  router.get('/api/deleteVideo', controller.web.deleteVideo)

  // 获取路径
  router.get('/api/getVideoPath', controller.web.getVideoPath)

  // 观看人数加1
  router.post('/api/videoAddNumber', controller.web.videoAddNumber)

  // 评论
  router.post('/api/submitComments', controller.web.submitComments)

  // 登录写死
  router.post('/api/auth/login', controller.web.login)

  // 退出登录写死
  router.post('/api/auth/logout', controller.web.logout)

  // 用户信息写死
  router.get('/api/user/info', controller.web.userInfo)

  // 评论列表
  router.get('/api/getCommentsList', controller.web.getCommentsList)

  // 猜你喜欢
  router.get('/api/getGuessYouLikeList', controller.web.getGuessYouLikeList)

  // 删除评论
  router.get('/api/deleteComments', controller.web.deleteComments)

  // 常见问题
  router.post('/api/submitProblem', controller.web.submitProblem)

  // 常见问题
  router.get('/api/getProblemList', controller.web.getProblemList)

  // 删除常见问题
  router.get('/api/deleteProblem', controller.web.deleteProblem)

  // 获取有帮助数量
  router.get('/api/getGiveLikeCount', controller.web.getGiveLikeCount)

  // 有帮助
  router.get('/api/giveLike', controller.web.giveLike)

  // 新增发展历程年份
  router.post('/api/setDevelopmentYear', controller.web.setDevelopmentYear)

  // 获取发展历程年份
  router.get('/api/getDevelopmentYear', controller.web.getDevelopmentYear)

  // 获取发展年份事件
  router.get('/api/getDevelopmentEvent', controller.web.getDevelopmentEvent)

  // 编辑年份事件
  router.post('/api/setDevelopmentEvent', controller.web.setDevelopmentEvent)

  // 删除发展年份
  router.get('/api/deleteDevelopmentYear', controller.web.deleteDevelopmentYear)

  // // 导入中奖名单表格
  // router.post('/api/import', controller.file.import)

  // // 导出实物中奖名单表格
  // router.get('/api/goods/export', controller.file.goodsExport)

  // // 活动标题列表
  // router.get(
  //   '/api/web/reward/enumeration/list',
  //   controller.web.queryActivityTitleList,
  // )

  // // web实物中奖名单
  // router.post('/api/web/reward/goods/list', controller.web.queryGoodsRewardList)
}
