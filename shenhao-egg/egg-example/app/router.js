'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
// eslint-disable-next-line no-undef
module.exports = (app) => {
  const { router, controller } = app
  router.get('/', controller.home.index)
  router.get('/custom', controller.web.custonIndex)

  // // 上传图片
  // router.post('/api/file', controller.file.create)

  // // 获取图片
  // router.get('/api/picture/:pmCode', controller.file.download)

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
