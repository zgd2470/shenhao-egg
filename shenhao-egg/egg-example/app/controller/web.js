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
}

// eslint-disable-next-line no-undef
module.exports = CustomController
