'use strict'

const Controller = require('egg').Controller

const uuid = require('node-uuid')
const moment = require('moment')


class CustomController extends Controller {
  async custonIndex() {
    // 注意这里要定义成异步方法防止请求被阻塞
    // let {id} = this.ctx.params; // 获取路由参数
    // let {name} = this.ctx.query; // 获取用户入参
    const options = { id: '5', name: 2 }

    // 调用Service层传参处理，返回结果赋值
    const info = await this.ctx.service.custimService.getInfo(options)
    this.ctx.body = {
      code: 200,
      data: info,
    } // 返回体
    this.ctx.status = 200
  }



  // 实物中奖名单列表
  async queryGoodsRewardList() {
    const {
      pageNo,
      pageSize,
      isScore,
      activityPmCode,
      goodsSku,
      award,
    } = this.ctx.request.body

    const queryBody = {
      pageNumber: pageNo || 1,
      pageSize: pageSize || 10,
      is_score: isScore, // 0 分享   1积分
      activity_pm_code: activityPmCode,
      goods_sku: goodsSku,
      award,
    }

    const result = await this.ctx.service.goodService.queryRewardList(
      queryBody,
      typeEnum['goods'],
    )
    const outData = result.data.map((info) => {
      return {
        pmCode: info.pm_code,
        startTime: info.start_time,
        endTime: info.end_time,
        goodsSku: info.goods_sku,
        userName: info.userName,
        mobilePhone: info.mobilePhone,
        address: info.address, //核销地址
        rewardType: info.reward_type, //0 实物  1 优惠券
        userPmCode: info.user_pm_code,
        isScore: info.is_score,
        title: info.title, //活动标题
        award: info.award,
        activityPmCode: info.activity_pm_code,
        level: info.level,
        goodsSize: info.goods_size,
        productShortTitle: info.productShortTitle,
      }
    })
    this.ctx.body = {
      message: '操作成功',
      success: true,
      rowsCount: result.rowsCount,
      pageSize: result.pageSize,
      pageNumber: result.pageNumber,
      data: outData,
    }
  }

 
}

// eslint-disable-next-line no-undef
module.exports = CustomController
