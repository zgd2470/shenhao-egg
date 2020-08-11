/* eslint-disable no-dupe-class-members */
/* eslint-disable no-undef */
'use strict'

const Service = require('egg').Service

class FillUtil extends Service {
  //新增参数封装方法
  async fillNewRecord(body) {
    // eslint-disable-next-line no-undef
    const pm_code = await this.ctx.service.uuid.getUuid()
    const create_time = await this.ctx.service.data.getCurrentDate()
    const newBody = {
      pm_code: pm_code,
      create_time: create_time,
      deleted: 0,
    }
    return Object.assign(body, newBody)
  }

  //更新参数封装方法
  async fillModifyRecord(body) {
    // eslint-disable-next-line no-undef
    const modify_time = await this.ctx.service.data.getCurrentDate()

    const newBody = {
      modify_time: modify_time,
    }
    return Object.assign(body, newBody)
  }
}

// eslint-disable-next-line no-undef
module.exports = FillUtil
