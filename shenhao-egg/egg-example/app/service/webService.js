/* eslint-disable no-undef */

const await = require('await-stream-ready/lib/await')

const Service = require('egg').Service

class WebService extends Service {
  // 新建和编辑视频
  async setVideoDetail(info) {
    const {
      img_pm_code,
      is_recommended,
      number,
      title,
      introduction,
      video_pm_code,
      pm_code,
    } = info
    console.log(info)
    if (pm_code) {
      // 编辑
      const options = {
        where: {
          pm_code,
        },
      }
      const newInfo = await this.ctx.service.fillUtil.fillModifyRecord(info)
      const result = await this.app.mysql.update(
        'video_table',
        newInfo,
        options,
      )
      return result.affectedRows === 1
    }
    if (!pm_code) {
      // 新增
      const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
      const result = await this.app.mysql.insert('video_table', newInfo)
      return result.affectedRows === 1
    }
  }

  // 获取视频列表
  async getVideoList({ title, isRecommended, current = 1, pageSize = 10 }) {
    let sqlWhere = 'deleted = 0'

    const where = {
      deleted: 0,
    }

    const columns = [
      'pm_code',
      'img_pm_code',
      'is_recommended',
      'number',
      'title',
      'introduction',
      'video_pm_code',
    ]

    if (title) {
      where.title = title
      sqlWhere += ` and title='${title}'`
    }
    if (isRecommended) {
      where.is_recommended = isRecommended
      sqlWhere += ` and is_recommended='${isRecommended}'`
    }
    const option = {
      columns,
      where,
      orders: [['create_time', 'desc']],
      limit: Number(pageSize), // 返回数据量
      offset: (Number(current) - 1) * Number(pageSize), // 数据偏移量
    }
    const list = (await this.app.mysql.select('video_table', option)) || []
    const total = await this.app.mysql.query(
      `select COUNT(1) as total FROM video_table where ${sqlWhere} `,
    )

    return {
      total: JSON.parse(JSON.stringify(total))[0].total,
      list: JSON.parse(JSON.stringify(list)),
    }
  }

  // 获取视屏得到详情
  async getVideoDetail(pmCode) {
    const option = {
      where: {
        pm_code: pmCode,
      },
      columns: [
        'pm_code',
        'img_pm_code',
        'is_recommended',
        'number',
        'title',
        'introduction',
        'video_pm_code',
      ],
    }
    const result = (await this.app.mysql.select('video_table', option)) || []
    return JSON.parse(JSON.stringify(result))[0]
  }

  // 删除视频
  async deleteVideo(pmCode) {
    const options = {
      where: {
        pm_code: pmCode,
      },
    }
    const result = await this.app.mysql.update(
      'video_table',
      { deleted: 1 },
      options,
    )
    return result.affectedRows === 1
  }
}
module.exports = WebService
