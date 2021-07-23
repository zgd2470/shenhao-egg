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

  // 统计
  router.post('/api/setStatistical', controller.web.setStatistical)

  // 统计
  router.get('/api/getStatistical', controller.web.getStatistical)

  // 预约演示
  router.post('/api/setDemonstrate', controller.web.setDemonstrate)

  // 预约列表
  router.get('/api/getDemonstrateList', controller.web.getDemonstrateList)

  // 处理预约演示
  router.post('/api/dealDemonstrate', controller.web.dealDemonstrate)

  // 成为合作伙伴
  router.post('/api/setPartner', controller.web.setPartner)

  // 成为合作伙伴列表
  router.get('/api/getPartnerList', controller.web.getPartnerList)

  // 处理合作伙伴
  router.post('/api/dealPartner', controller.web.dealPartner)

  // 试用申请
  router.post('/api/setTrial', controller.web.setTrial)

  // 试用申请列表
  router.get('/api/getTrialList', controller.web.getTrialList)

  // 处理试用申请
  router.post('/api/dealTrial', controller.web.dealTrial)

  // 新建和编辑Banner
  router.post('/api/setBanner', controller.web.setBanner)

  // Banner列表
  router.get('/api/getBannerList', controller.web.getBannerList)

  // Banner详情
  router.get('/api/getBannerDetail', controller.web.getBannerDetail)

  // 删除Banner
  router.get('/api/deleteBanner', controller.web.deleteBanner)

  // 官网获取轮播Banner
  router.get('/api/getBannerArray', controller.web.getBannerArray)

  // 获取菜单
  router.get('/api/getMenuArray', controller.web.getMenuArray)

  // 新增编辑用户
  router.post('/api/setUser', controller.web.setUser)

  // 用户列表
  router.get('/api/getUserList', controller.web.getUserList)

  // 用户详情
  router.get('/api/getUserDetail', controller.web.getUserDetail)

  // 删除用户
  router.get('/api/deleteUser', controller.web.deleteUser)

  // 新建和编辑新闻
  router.post('/api/setNewsDetail', controller.web.setNewsDetail)

  // 获取新闻详情
  router.get('/api/getNewsDetail', controller.web.getNewsDetail)

  // 新闻列表
  router.get('/api/getNewsList', controller.web.getNewsList)

  // 新闻删除
  router.get('/api/deleteNews', controller.web.deleteNews)

  // 官网新闻详情
  router.get('/api/getWebSiteNewsDetail', controller.web.getWebSiteNewsDetail)

  // 官网新闻观看加1
  router.post('/api/newsAddNumber', controller.web.newsAddNumber)

  // 相关推荐
  router.get('/api/relatedRecommend', controller.web.relatedRecommend)

  // 批量处理预约演示
  router.post('/api/batchDealDemonstrate', controller.web.batchDealDemonstrate)

  // 批量处理合作伙伴
  router.post('/api/batchDealPartner', controller.web.batchDealPartner)

  // 批量处理试用申请
  router.post('/api/batchDealTrial', controller.web.batchDealTrial)

  // 批量预约演示导出
  router.get(
    '/api/batchExportDemonstrate',
    controller.file.batchExportDemonstrate,
  )

  // 批量预约演示导出
  router.get(
    '/api/batchExportSearchDemonstrate',
    controller.file.batchExportSearchDemonstrate,
  )

  // 批量预约演示导出
  router.get('/api/batchExportPartner', controller.file.batchExportPartner)

  // 批量预约演示导出
  router.get(
    '/api/batchExportSearchPartner',
    controller.file.batchExportSearchPartner,
  )

  // 批量试用申请导出
  router.get('/api/batchExportTrial', controller.file.batchExportTrial)

  // 批量试用申请导出
  router.get(
    '/api/batchExportSearchTrial',
    controller.file.batchExportSearchTrial,
  )

  // 新增活动
  router.post('/api/setActivity', controller.web.setActivity)

  // 活动列表
  router.get('/api/getActivityList', controller.web.getActivityList)

  // 删除活动
  router.get('/api/deleteActivity', controller.web.deleteActivity)

  // 获取活动详情
  router.get('/api/getActivityDetail', controller.web.getActivityDetail)

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
