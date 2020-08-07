/* eslint-disable no-undef */
const getGoodsDetail = 'https://www.misssixty.com.cn/m/ProductInfoQuery.action' // 获取商品详情

const sendDiscountApiUrl = 'http://crm.service.trendygroup-it.com/' // 正式环境

// const sendDiscountApiUrl = 'http://172.17.22.229:8090/'; //  测试环境

const Service = require('egg').Service

class GoodService extends Service {
  // 活动配置保存
  async activitySetting(body, goodsList) {
    const conn = await this.app.mysql.beginTransaction() // 初始化事务
    try {
      await conn.insert('activity', body)
      goodsList.forEach(async (info) => {
        conn.insert('goods', info)
      }),
        await conn.commit() // 提交事务
    } catch (err) {
      await conn.rollback()
      return false
    }
    return true
  }

  // 活动配置修改
  async activityEdit(activity_pm_code, body) {
    const options = {
      where: {
        activity_pm_code,
      },
    }
    const result = await this.app.mysql.update('activity', body, options)
    return result
  }
}
module.exports = GoodService
