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
    const {
      imgPmCode,
      isRecommended,
      number,
      title,
      introduction,
      videoPmCode,
      pmCode,
      videoPath,
      sorting,
      isGuessLike,
      videoLink,
      isVideoLink,
      tags,
    } = body
    const info = {
      img_pm_code: imgPmCode,
      is_recommended: isRecommended,
      sorting,
      is_guess_like: isGuessLike,
      number,
      title,
      introduction,
      video_pm_code: videoPmCode,
      pm_code: pmCode,
      video_path: videoPath,
      video_link: videoLink,
      is_video_link: isVideoLink,
    }
    const result = await this.ctx.service.webService.setVideoDetail(info, tags)
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
    const { title, isRecommended, current = 1, pageSize = 500, text } = query
    let tagsList = []
    if (text) {
      tagsList = await this.ctx.service.webService.getTagsText(text)
      if (!tagsList.length) {
        this.ctx.body = {
          success: true,
          message: '操作成功',
          data: {
            total: 0,
            list: [],
          },
        }
        return
      }
    }
    const newResult = []
    console.log('-----')
    console.log(tagsList)
    tagsList.forEach((info) => {
      newResult.push(info.relation_pm_code)
    })

    const tagsPmCodeList = [...new Set(newResult)]

    console.log(tagsPmCodeList)

    const data = await this.ctx.service.webService.getVideoList({
      title,
      isRecommended,
      current,
      pageSize,
      tagsPmCodeList,
    })

    return Promise.all(
      data.list.map(async (info) => {
        const tags = await this.ctx.service.webService.getTags(info.pm_code)
        const newTags = tags.map((info) => info.text)
        return {
          pmCode: info.pm_code,
          imgPmCode: info.img_pm_code,
          isRecommended: info.is_recommended,
          number: info.number,
          title: info.title,
          introduction: info.introduction,
          videoPmCode: info.video_pm_code,
          videoPath: info.video_path,
          sorting: info.sorting,
          isGuessLike: info.is_guess_like,
          isVideoLink: info.is_video_link,
          videoLink: info.video_link,
          createTime: moment(info.create_time).format('YYYY-MM-DD HH:mm:ss'),
          tags: newTags,
        }
      }),
    ).then((result) => {
      this.ctx.body = {
        success: true,
        message: '操作成功',
        data: {
          total: data.total || 0,
          list: result,
        },
      }
    })
  }

  // 获取视屏得到详情
  async getVideoDetail() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.getVideoDetail(pmCode)
    const tags = await this.ctx.service.webService.getTags(pmCode)
    const newTags = tags.map((info) => info.text)
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
      sorting: result.sorting,
      isGuessLike: result.is_guess_like,
      isVideoLink: result.is_video_link,
      videoLink: result.video_link,
      tags: newTags,
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

  // 登录
  async login() {
    const { body = {} } = this.ctx.request
    const { username, password } = body
    const queryResult = await this.ctx.service.webService.login({
      username,
      password,
    })

    if (!queryResult) {
      this.ctx.body = {
        success: false,
        message: '账户或密码错误',
        code: 401,
        result: {
          isLogin: true,
        },
      }
      return
    }

    const token = this.app.jwt.sign(
      {
        username: username, //需要存储的 token 数据
      },
      this.app.config.jwt.secret,
    )

    const result = {
      username: queryResult.username,
      avatar: queryResult.avatar,
      pmCode: queryResult.pm_code,
      token,
    }

    this.ctx.body = {
      success: true,
      message: '操作成功',
      code: 200,
      result,
    }
  }

  // TODO：退出登录写死
  async logout() {
    const {} = this.ctx.request

    this.ctx.body = {
      success: true,
      message: '注销成功',
      code: 0,
      result: {},
    }
  }

  async userInfo() {
    const { query } = this.ctx.request
    const { pmCode } = query
    if (!pmCode) {
      this.ctx.body = {
        success: false,
        message: '获取失败',
        code: 0,
        result: {},
      }
      return
    }
    const queryResult = await this.ctx.service.webService.queryUserInfo(pmCode)
    if (!queryResult) {
      this.ctx.body = {
        success: false,
        message: '获取失败',
        code: 0,
        result: {},
      }
      return
    }

    const permissions = queryResult.permissions.split(',').map((info) => {
      return {
        permissionId: info,
      }
    })

    if (queryResult.permissions.includes('knowledge')) {
      permissions.push({ permissionId: 'knowledge' })
    }
    if (queryResult.permissions.includes('form')) {
      permissions.push({ permissionId: 'form' })
    }
    if (queryResult.permissions.includes('about')) {
      permissions.push({ permissionId: 'about' })
    }
    if (queryResult.permissions.includes('setting')) {
      permissions.push({ permissionId: 'setting' })
    }

    this.ctx.body = {
      success: true,
      message: '',
      code: 0,
      result: {
        username: queryResult.username,
        name: queryResult.name,
        pmCode: queryResult.pm_code,
        id: queryResult.id,
        role: { permissions },
      },
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

  // 猜你喜欢
  async getGuessYouLikeList() {
    const data = await this.ctx.service.webService.getGuessYouLikeList()
    const newData = data.map((info) => {
      return {
        pmCode: info.pm_code,
        imgPmCode: info.img_pm_code,
        number: info.number,
        title: info.title,
        averageScore: info.averageScore,
        createTime: info.create_time
          ? moment(info.create_time).format('YYYY-MM-DD HH:mm:ss')
          : '',
      }
    })
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: newData,
    }
  }

  // 删除评论
  async deleteComments() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.deleteComments(pmCode)
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

  // 常见问题
  async submitProblem() {
    const { body = {} } = this.ctx.request
    const { title, type, answer, pmCode } = body
    const info = {
      title,
      type,
      answer,
      pm_code: pmCode,
    }
    const result = await this.ctx.service.webService.submitProblem(info)
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

  // 常见问题列表
  async getProblemList() {
    const { query } = this.ctx.request
    const { title, type } = query

    const data = await this.ctx.service.webService.getProblemList(title, type)
    const newData = data.map((info) => {
      return {
        pmCode: info.pm_code,
        title: info.title,
        answer: info.answer,
        type: info.type,
      }
    })
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: newData,
    }
  }

  // 删除常见问题
  async deleteProblem() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.deleteProblem(pmCode)
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

  // 知识有帮助
  async giveLike() {
    if (await this.ctx.service.webService.giveLike()) {
      this.ctx.body = {
        success: true,
        message: '操作成功',
      }
      return
    }

    this.ctx.body = {
      success: false,
      message: '操作失败',
    }
  }

  // 知识有帮助数量
  async getGiveLikeCount() {
    const data = await this.ctx.service.webService.getGiveLikeCount()
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data,
    }
  }

  // 新增发展历程年份
  async setDevelopmentYear() {
    const { body = {} } = this.ctx.request
    const { year } = body
    const monthArray = [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ]
    const queryResult = await this.ctx.service.webService.queryDevelopmentYear(
      year,
    )
    if (queryResult) {
      this.ctx.body = {
        message: '该年份已存在',
        success: false,
      }
      return
    }
    const result = await this.ctx.service.webService.setDevelopmentYear({
      year,
    })
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '操作失败',
      }
      return
    }
    return Promise.all(
      monthArray.map(async (info, index) => {
        return await this.ctx.service.webService.setDevelopmentEvent({
          month: info,
          index,
          year_pm_code: result.pm_code,
        })
      }),
    ).then(() => {
      this.ctx.body = {
        success: true,
        message: '操作成功',
      }
    })
  }

  // 获取发展历程年份
  async getDevelopmentYear() {
    const result = await this.ctx.service.webService.getDevelopmentYear()
    const newResult = result.map((info) => {
      return {
        key: info.pm_code,
        title: info.year,
      }
    })
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: newResult,
    }
  }

  // 获取发展年份事件
  async getDevelopmentEvent() {
    const { query } = this.ctx.request
    const { yearPmCode } = query
    const result = await this.ctx.service.webService.getDevelopmentEvent(
      yearPmCode,
    )
    const newResult = result.map((info) => {
      return {
        pmCode: info.pm_code,
        month: info.month,
        event: info.event || '',
      }
    })
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: newResult,
    }
  }

  // 编辑 新增发展年份事件
  async setDevelopmentEvent() {
    const { body = {} } = this.ctx.request
    const { pmCode, month, event } = body
    const info = {
      pm_code: pmCode,
      month,
      event,
    }
    const result = await this.ctx.service.webService.setDevelopmentEvent(info)
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

  // 删除历程年份
  async deleteDevelopmentYear() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.deleteDevelopmentYear(
      pmCode,
    )
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

  // 统计
  async setStatistical() {
    const { body = {} } = this.ctx.request
    const { typeOne, typeTwo, typeThree, ip } = body
    const time = moment().format('YYYY-MM-DD')
    const info = {
      type_one: typeOne,
      type_two: typeTwo,
      type_three: typeThree,
      ip,
      time,
    }

    const queryResult = await this.ctx.service.webService.queryHasStatistical(
      info,
    )
    if (queryResult) {
      this.ctx.body = {
        message: '已记录过',
        success: false,
      }
      return
    }
    const result = await this.ctx.service.webService.setStatistical(info)

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

  // 统计
  async getStatistical() {
    const { query = {} } = this.ctx.request
    const { typeOne, typeTwo, typeThree } = query
    const info = {
      type_one: typeOne,
      type_two: typeTwo,
      type_three: typeThree,
    }
    if (Number(typeTwo) === 0) {
      const result = await this.ctx.service.webService.getStatisticalAll(info)
      this.ctx.body = {
        success: true,
        message: '操作成功',
        data: result,
      }
      return
    }
    const data = await this.ctx.service.webService.getStatistical(info)
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data,
    }
  }

  // 预约演示提交
  async setDemonstrate() {
    const { body = {} } = this.ctx.request
    const {
      name,
      phone,
      position,
      companyName,
      companyAddress,
      industry,
    } = body
    const info = {
      name,
      phone,
      position,
      industry,
      company_name: companyName,
      company_address: companyAddress,
      is_deal: 0,
    }
    const queryResult = await this.ctx.service.webService.queryDemonstrate(
      phone,
    )
    if (queryResult) {
      this.ctx.body = {
        message: '该手机用户已提交过',
        success: false,
      }
      return
    }
    const result = await this.ctx.service.webService.setDemonstrate(info)
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '操作失败',
      }
      return
    }
    this.ctx.body = {
      success: true,
      message: '提交成功',
    }
  }

  // 预约演示列表
  async getDemonstrateList() {
    const { query } = this.ctx.request
    const { phone, isDeal, current = 1, pageSize = 10 } = query

    const data = await this.ctx.service.webService.getDemonstrateList({
      phone,
      is_deal: isDeal,
      current,
      pageSize,
    })
    const newData = {
      total: data.total || 0,
      list: data.list.map((info) => {
        return {
          pmCode: info.pm_code,
          name: info.name,
          phone: info.phone,
          position: info.position,
          companyName: info.company_name,
          companyAddress: info.company_address,
          industry: info.industry,
          isDeal: info.is_deal,
          createTime: info.create_time,
        }
      }),
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: newData,
    }
  }

  // 处理预约演示
  async dealDemonstrate() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.dealDemonstrate(pmCode)
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

  // 成为合作伙伴
  async setPartner() {
    const { body = {} } = this.ctx.request
    const { name, phone, position, companyName, companyPhone } = body
    const info = {
      name,
      phone,
      position,
      company_name: companyName,
      company_phone: companyPhone,
      is_deal: 0,
    }
    const queryResult = await this.ctx.service.webService.queryPartner(phone)
    if (queryResult) {
      this.ctx.body = {
        message: '该手机用户已提交过',
        success: false,
      }
      return
    }
    const result = await this.ctx.service.webService.setPartner(info)
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '操作失败',
      }
      return
    }
    this.ctx.body = {
      success: true,
      message: '提交成功',
    }
  }

  // 成为合作伙伴列表
  async getPartnerList() {
    const { query } = this.ctx.request
    const { phone, isDeal, current = 1, pageSize = 10 } = query

    const data = await this.ctx.service.webService.getPartnerList({
      phone,
      is_deal: isDeal,
      current,
      pageSize,
    })
    const newData = {
      total: data.total || 0,
      list: data.list.map((info) => {
        return {
          pmCode: info.pm_code,
          name: info.name,
          phone: info.phone,
          position: info.position,
          companyName: info.company_name,
          companyPhone: info.company_phone,
          isDeal: info.is_deal,
          createTime: info.create_time,
        }
      }),
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: newData,
    }
  }

  // 处理合作伙伴
  async dealPartner() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.dealPartner(pmCode)
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

  // 试用申请
  async setTrial() {
    const { body = {} } = this.ctx.request
    const { name, phone, position, companyName, companySize, email } = body
    const info = {
      name,
      phone,
      position,
      company_name: companyName,
      company_size: companySize,
      email,
      is_deal: 0,
    }
    const queryResult = await this.ctx.service.webService.queryTrial(phone)
    if (queryResult) {
      this.ctx.body = {
        message: '该手机用户已提交过',
        success: false,
      }
      return
    }
    const result = await this.ctx.service.webService.setTrial(info)
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '操作失败',
      }
      return
    }
    this.ctx.body = {
      success: true,
      message: '提交成功',
    }
  }

  // 试用申请列表
  async getTrialList() {
    const { query } = this.ctx.request
    const { phone, isDeal, current = 1, pageSize = 10 } = query

    const data = await this.ctx.service.webService.getTrialList({
      phone,
      is_deal: isDeal,
      current,
      pageSize,
    })
    const newData = {
      total: data.total || 0,
      list: data.list.map((info) => {
        return {
          pmCode: info.pm_code,
          name: info.name,
          phone: info.phone,
          position: info.position,
          companyName: info.company_name,
          companySize: info.company_size,
          email: info.email,
          isDeal: info.is_deal,
          createTime: info.create_time,
        }
      }),
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: newData,
    }
  }

  // 处理试用申请
  async dealTrial() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.dealTrial(pmCode)
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

  // 编辑 新增Banner
  async setBanner() {
    const { body = {} } = this.ctx.request
    const { imgPmCode, pmCode, state, sorting, type, note } = body
    const info = {
      img_pm_code: imgPmCode,
      pm_code: pmCode,
      sorting,
      state,
      type,
      note,
    }
    const result = await this.ctx.service.webService.setBanner(info)
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

  // Banner列表
  async getBannerList() {
    const { query } = this.ctx.request
    const { type, current = 1, pageSize = 500 } = query

    const data = await this.ctx.service.webService.getBanner({
      type,
      current,
      pageSize,
    })
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: {
        total: data.total || 0,
        list: data.list.map((info) => {
          return {
            imgPmCode: info.img_pm_code,
            pmCode: info.pm_code,
            sorting: info.sorting,
            state: info.state,
            type: info.type,
            note: info.note,
          }
        }),
      },
    }
  }

  // 删除Banner
  async deleteBanner() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.deleteBanner(pmCode)
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

  // 获取Banner得到详情
  async getBannerDetail() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.getBannerDetail(pmCode)
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
      type: result.type,
      state: result.state,
      note: result.note,
      sorting: result.sorting,
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data,
    }
  }

  // 获取官网Banner
  async getBannerArray() {
    const { query } = this.ctx.request
    const { type } = query
    const result = await this.ctx.service.webService.getBannerArray(type)
    const data = result.map((info) => info.img_pm_code)
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data,
    }
  }

  // 获取菜单
  async getMenuArray() {
    const { query } = this.ctx.request
    const result = await this.ctx.service.webService.getMenuArray()
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: result,
    }
  }

  // 新增用户
  async setUser() {
    const { body = {} } = this.ctx.request
    const {
      username,
      password,
      permissions = [],
      name,
      pmCode,
      department,
    } = body

    const queryResult = await this.ctx.service.webService.queryUserName(
      username,
    )
    if (queryResult && !pmCode) {
      this.ctx.body = {
        message: '该账号已存在',
        success: false,
      }
      return
    }
    const info = {
      username,
      password,
      permissions: permissions.length ? permissions.join(',') : '',
      name,
      pm_code: pmCode,
      department,
    }
    const result = await this.ctx.service.webService.setUser(info)
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
  async getUserList() {
    const { query } = this.ctx.request
    const { username, current = 1, pageSize = 10, department } = query

    const data = await this.ctx.service.webService.getUserList({
      username,
      current,
      pageSize,
      department,
    })
    const newData = {
      total: data.total || 0,
      list: data.list.map((info) => {
        return {
          pmCode: info.pm_code,
          name: info.name,
          username: info.username,
          department: info.department,
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

  // 获取用户得到详情
  async getUserDetail() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.getUserDetail(pmCode)
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '获取失败',
      }
      return
    }
    const data = {
      pmCode: result.pm_code,
      name: result.name,
      username: result.username,
      password: result.password,
      department: result.department,
      permissions: result.permissions.split(',') || [],
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data,
    }
  }

  // 删除用户
  async deleteUser() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.deleteUser(pmCode)
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

  // 编辑 新增 新闻
  async setNewsDetail() {
    const { body = {} } = this.ctx.request
    const {
      title,
      auth,
      text,
      imgPmCode,
      seo,
      indexRecommended,
      type,
      pmCode,
      tags,
      introduce,
      number = 0,
    } = body
    const info = {
      title,
      auth,
      text,
      seo,
      index_recommended: indexRecommended,
      type,
      img_pm_code: imgPmCode,
      pm_code: pmCode,
      introduce,
      number,
    }
    const result = await this.ctx.service.webService.setNewsDetail(info, tags)
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

  // 获取新闻详情
  async getNewsDetail() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.getNewsDetail(pmCode)
    const tags = await this.ctx.service.webService.getTags(pmCode)
    const newTags = tags.map((info) => info.text)
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '获取失败',
      }
      return
    }
    const data = {
      title: result.title,
      auth: result.auth,
      text: result.text,
      seo: result.seo,
      indexRecommended: result.index_recommended,
      type: result.type,
      imgPmCode: result.img_pm_code,
      pm_code: result.pmCode,
      introduce: result.introduce,
      number: result.number,
      create_time: result.createTime,
      tags: newTags,
    }
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data,
    }
  }

  // 新闻列表
  async getNewsList() {
    const { query } = this.ctx.request
    const { title, type, indexRecommended, current = 1, pageSize = 500 } = query

    const data = await this.ctx.service.webService.getNewsList({
      title,
      type,
      index_recommended: indexRecommended,
      current,
      pageSize,
    })

    return Promise.all(
      data.list.map(async (info) => {
        const tags = await this.ctx.service.webService.getTags(info.pm_code)
        const newTags = tags.map((info) => info.text)
        return {
          pmCode: info.pm_code,
          title: info.title,
          auth: info.auth,
          seo: info.seo,
          imgPmCode: info.img_pm_code,
          indexRecommended: info.index_recommended,
          type: info.type,
          introduce: info.introduce,
          number: info.number,
          createTime: info.create_time
            ? moment(info.create_time).format('YYYY-MM-DD HH:mm:ss')
            : '',
          tags: newTags,
        }
      }),
    ).then((result) => {
      this.ctx.body = {
        success: true,
        message: '操作成功',
        data: {
          total: data.total || 0,
          list: result,
        },
      }
    })
  }

  // 删除新闻
  async deleteNews() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.deleteNews(pmCode)
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

  // 获取官网新闻详情
  async getWebSiteNewsDetail() {
    const { query } = this.ctx.request
    const { pmCode } = query
    const result = await this.ctx.service.webService.getNewsDetail(pmCode)
    const tags = await this.ctx.service.webService.getTags(pmCode)

    const newTags = tags.map((info) => info.text)
    if (!result) {
      this.ctx.body = {
        success: false,
        message: '获取失败',
      }
      return
    }
    const data = {
      title: result.title,
      auth: result.auth,
      text: result.text,
      seo: result.seo,
      indexRecommended: result.index_recommended,
      type: result.type,
      imgPmCode: result.img_pm_code,
      pmCode: result.pm_code,
      introduce: result.introduce,
      number: result.number,
      createTime: result.create_time
        ? moment(result.create_time).format('YYYY-MM-DD HH:mm:ss')
        : '',
      tags: newTags,
    }

    const {
      last = null,
      next = null,
    } = await this.ctx.service.webService.getLastNext(result.id, result.type)

    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: {
        ...data,
        last,
        next,
      },
    }
  }

  // 新闻看过人数加1
  async newsAddNumber() {
    const { body } = this.ctx.request
    const { pmCode } = body

    await this.ctx.service.webService.newsAddNumber(pmCode)

    this.ctx.body = {
      success: true,
      message: '操作成功',
    }
  }

  // 新闻相关推荐
  async relatedRecommend() {
    const { query } = this.ctx.request
    const { pmCode, type } = query
    const tags = await this.ctx.service.webService.getTags(pmCode)
    const result = await this.ctx.service.webService.relatedRecommend(tags)
    const newResult = []
    result.forEach((info) => {
      newResult.push(info.relation_pm_code)
    })

    const pmCodeList = [...new Set(newResult)]
    return Promise.all(
      pmCodeList.map(async (info) => {
        return await this.ctx.service.webService.getNewsDetail(info)
      }),
    ).then((result) => {
      const list = []
      result.forEach((info) => {
        if (info.type === type) {
          list.push({
            title: info.title,
            createTime: info.create_time
              ? moment(info.create_time).format('YYYY-MM-DD HH:mm:ss')
              : '',
            number: info.number,
            introduce: info.introduce,
            pmCode: info.pm_code,
            imgPmCode: result.img_pm_code,
          })
        }
      })
      this.ctx.body = {
        success: true,
        message: '操作成功',
        data: list.sort(function (a, b) {
          return a.createTime < b.createTime ? 1 : -1
        }),
      }
    })
  }
}

// eslint-disable-next-line no-undef
module.exports = CustomController
