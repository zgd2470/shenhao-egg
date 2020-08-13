'use strict'

const Controller = require('egg').Controller

const uuid = require('node-uuid')
const moment = require('moment')
const await = require('await-stream-ready/lib/await')

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

  // 编辑 新增
  async setVideoDetail() {
    const { body = {} } = this.ctx.request
    console.log(body)
    const {
      imgPmCode,
      isRecommended,
      number,
      title,
      introduction,
      videoPmCode,
      pmCode,
      videoPath,
    } = body
    const info = {
      img_pm_code: imgPmCode,
      is_recommended: isRecommended,
      number,
      title,
      introduction,
      video_pm_code: videoPmCode,
      pm_code: pmCode,
      video_path: videoPath,
    }
    const result = await this.ctx.service.webService.setVideoDetail(info)
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '操作失败',
      }
      return
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
    }
  }

  // 视频列表
  async getVideoList() {
    const { query } = this.ctx.request
    const { title, isRecommended, current = 1, pageSize = 500 } = query

    const data = await this.ctx.service.webService.getVideoList({
      title,
      isRecommended,
      current,
      pageSize,
    })
    const newData = {
      total: data.total || 0,
      list: data.list.map((info) => {
        return {
          pmCode: info.pm_code,
          imgPmCode: info.img_pm_code,
          isRecommended: info.is_recommended,
          number: info.number,
          title: info.title,
          introduction: info.introduction,
          videoPmCode: info.video_pm_code,
          videoPath: info.video_path,
          createTime: moment(info.create_time).format('YYYY-MM-DD HH:mm:ss'),
        }
      }),
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: newData,
    }
  }

  // 获取视屏得到详情
  async getVideoDetail() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.getVideoDetail(pmCode)
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '获取失败',
      }
      return
    }
    const data = {
      pmCode: result.pm_code,
      imgPmCode: result.img_pm_code,
      isRecommended: result.is_recommended,
      number: result.number,
      title: result.title,
      introduction: result.introduction,
      videoPmCode: result.video_pm_code,
      videoPath: result.video_path,
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data,
    }
  }

  // 删除视频
  async deleteVideo() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.deleteVideo(pmCode)
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '操作失败',
      }
      return
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
    }
  }

  // 获取视频路径
  async getVideoPath() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result =
      (await this.ctx.service.webService.getVideoPath(pmCode)) || {}

    const newResult = result.file_path.replace(/app/g, '')

    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: newResult,
    }
  }

  // 观看过人数加1
  async videoAddNumber() {
    const { body } = this.ctx.request
    const { pmCode } = body

    await this.ctx.service.webService.videoAddNumber(pmCode)

    this.ctx.body = {
      success: true,
      message: '操作成功',
    }
  }

  // 评论
  async submitComments() {
    const { body = {} } = this.ctx.request
    const { videoPmCode, name, content, score } = body
    const info = {
      video_pm_code: videoPmCode,
      name,
      content,
      score,
    }
    const result = await this.ctx.service.webService.submitComments(info)
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '操作失败',
      }
      return
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
    }
  }

  // 评论列表
  async getCommentsList() {
    const { query } = this.ctx.request
    const { videoPmCode, current = 1, pageSize = 5 } = query

    const data = await this.ctx.service.webService.getCommentsList({
      video_pm_code: videoPmCode,
      current,
      pageSize,
    })
    const newData = {
      total: data.total || 0,
      totalScore: data.totalScore || 0,
      list: data.list.map((info) => {
        return {
          pmCode: info.pm_code,
          name: info.name,
          content: info.content,
          score: info.score,
          createTime: moment(info.create_time).format('YYYY-MM-DD HH:mm:ss'),
          title: info.title,
          videoPmCode: info.video_pm_code,
        }
      }),
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: newData,
    }
  }
}

// eslint-disable-next-line no-undef
module.exports = CustomController
