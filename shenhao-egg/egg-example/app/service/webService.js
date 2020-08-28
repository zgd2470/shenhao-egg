/* eslint-disable no-undef */

const await = require('await-stream-ready/lib/await')

const Service = require('egg').Service

class WebService extends Service {
  // 新建和编辑视频
  async setVideoDetail(info, tags) {
    const {
      img_pm_code,
      is_recommended,
      number,
      title,
      introduction,
      video_pm_code,
      pm_code,
      videoPath,
    } = info
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
      await this.setTags(pm_code, tags, 'video')
      return result.affectedRows === 1
    }
    if (!pm_code) {
      // 新增
      const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
      const result = await this.app.mysql.insert('video_table', newInfo)
      const value = await this.app.mysql.query(`
      select pm_code from video_table where id in (select max(id) from video_table  where deleted=0 )
      `)
      const newPmCode = JSON.parse(JSON.stringify(value))[0].pm_code
      await this.setTags(newPmCode, tags, 'video')
      return result.affectedRows === 1
    }
  }

  // 评论
  async submitComments(info) {
    const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
    const result = await this.app.mysql.insert('comments_table', newInfo)
    return result.affectedRows === 1
  }

  // 常见问题
  async submitProblem(info) {
    if (info.pm_code) {
      // 编辑
      const options = {
        where: {
          pm_code: info.pm_code,
        },
      }
      const newInfo = await this.ctx.service.fillUtil.fillModifyRecord(info)
      const result = await this.app.mysql.update(
        'problem_table',
        newInfo,
        options,
      )
      return result.affectedRows === 1
    }
    const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
    const result = await this.app.mysql.insert('problem_table', newInfo)
    return result.affectedRows === 1
  }

  // 评论列表
  async getCommentsList({ video_pm_code, current = 1, pageSize = 10 }) {
    let sqlWhere = 'deleted = 0'

    const where = {
      deleted: 0,
    }

    const columns = [
      'pm_code',
      'video_pm_code',
      'name',
      'content',
      'score',
      'create_time',
    ]

    if (video_pm_code) {
      where.video_pm_code = video_pm_code
      sqlWhere += ` and video_pm_code='${video_pm_code}'`
    }

    const option = {
      columns,
      where,
      orders: [['create_time', 'desc']],
      limit: Number(pageSize), // 返回数据量
      offset: (Number(current) - 1) * Number(pageSize), // 数据偏移量
    }

    const list = (await this.app.mysql.select('comments_table', option)) || []
    const total = await this.app.mysql.query(
      `select COUNT(1) as total FROM comments_table where ${sqlWhere} `,
    )

    const totalScore = await this.app.mysql.query(
      `select sum (score) as  totalScore from  comments_table where ${sqlWhere} `,
    )

    return Promise.all(
      list.map(async (info) => {
        const userOption = {
          where: {
            pm_code: info.video_pm_code,
            deleted: 0,
          },
          columns: ['title'],
        }
        let videoInfo = await this.app.mysql.select('video_table', userOption)
        videoInfo = JSON.parse(JSON.stringify(videoInfo))[0]
        return {
          ...info,
          title: videoInfo.title,
        }
      }),
    ).then((result) => {
      return {
        total: JSON.parse(JSON.stringify(total))[0].total,
        totalScore: JSON.parse(JSON.stringify(totalScore))[0].totalScore,
        list: result,
      }
    })
  }

  // 获取视频列表
  async getVideoList({
    title,
    isRecommended,
    current = 1,
    pageSize = 10,
    tagsPmCodeList,
  }) {
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
      'create_time',
      'video_path',
      'sorting',
      'is_guess_like',
      'is_video_link',
      'video_link',
    ]

    if (title) {
      where.title = title
      sqlWhere += ` and title='${title}'`
    }
    if (isRecommended) {
      where.is_recommended = isRecommended
      sqlWhere += ` and is_recommended='${isRecommended}'`
    }
    if (tagsPmCodeList.length) {
      for (let i = 0; i < tagsPmCodeList.length; i++) {
        if (i === 0) {
          sqlWhere += ` and (pm_code = '${tagsPmCodeList[i]}'`
          where.pm_code = [`${tagsPmCodeList[i]}`]
        }
        if (i > 0) {
          sqlWhere += ` or pm_code = '${tagsPmCodeList[i]}'`
          where.pm_code.push(`${tagsPmCodeList[i]}`)
        }
        if (i === tagsPmCodeList.length - 1) {
          sqlWhere += `)`
        }
      }
    }

    const option = {
      columns,
      where,
      orders: [['sorting', 'asc']],
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

  // 获取猜你喜欢
  async getGuessYouLikeList() {
    const option = {
      columns: ['pm_code', 'img_pm_code', 'number', 'title', 'create_time'],
      where: {
        deleted: 0,
        is_guess_like: 1,
      },
      orders: [['sorting', 'asc']],
      limit: 3, // 返回数据量
      offset: 0, // 数据偏移量
    }
    const list = (await this.app.mysql.select('video_table', option)) || []
    return Promise.all(
      list.map(async (info) => {
        let total = await this.app.mysql.query(
          `select COUNT(1) as total FROM comments_table where video_pm_code = '${info.pm_code}' `,
        )
        let totalScore = await this.app.mysql.query(
          `select sum (score) as  totalScore from  comments_table where video_pm_code = '${info.pm_code}' `,
        )
        total = JSON.parse(JSON.stringify(total))[0].total || 1
        totalScore = JSON.parse(JSON.stringify(totalScore))[0].totalScore || 0

        return {
          ...info,
          averageScore: (totalScore / total).toFixed(1) || 0,
        }
      }),
    )
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
        'video_path',
        'is_guess_like',
        'sorting',
        'is_video_link',
        'video_link',
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

  // 获取视频路径
  async getVideoPath(pmCode) {
    const option = {
      where: {
        pm_code: pmCode,
      },
      columns: ['pm_code', 'file_path'],
    }
    const result = (await this.app.mysql.select('file', option)) || []
    return JSON.parse(JSON.stringify(result))[0]
  }

  // 观看过人数加1
  async videoAddNumber(pmCode) {
    return await this.app.mysql.query(
      `update video_table set number=number+1 where pm_code='${pmCode}'`,
    )
  }

  // 删除评论
  async deleteComments(pmCode) {
    const options = {
      where: {
        pm_code: pmCode,
      },
    }
    const result = await this.app.mysql.update(
      'comments_table',
      { deleted: 1 },
      options,
    )
    return result.affectedRows === 1
  }

  // 常见问题列表
  async getProblemList(title, type) {
    const where = {
      deleted: 0,
    }

    if (title) {
      where.title = title
    }

    if (type) {
      where.type = type
    }

    const option = {
      columns: ['title', 'answer', 'type', 'pm_code'],
      where,
      orders: [['create_time', 'desc']],
    }
    return (await this.app.mysql.select('problem_table', option)) || []
  }

  // 删除常见问题
  async deleteProblem(pmCode) {
    const options = {
      where: {
        pm_code: pmCode,
      },
    }
    const result = await this.app.mysql.update(
      'problem_table',
      { deleted: 1 },
      options,
    )
    return result.affectedRows === 1
  }

  // 知识有帮助
  async giveLike() {
    const newInfo = await this.ctx.service.fillUtil.fillNewRecord({})
    const result = await this.app.mysql.insert('give_like_table', newInfo)
    return result.affectedRows === 1
  }

  // 知识有帮助数量
  async getGiveLikeCount() {
    const total = await this.app.mysql.query(
      `select COUNT(1) as total FROM give_like_table where deleted = 0 `,
    )
    return JSON.parse(JSON.stringify(total))[0].total
  }

  // 查询发展年份是否存在
  async queryDevelopmentYear(year) {
    const result = await this.app.mysql.get('development_year_table', {
      year,
      deleted: 0,
    })

    return JSON.parse(JSON.stringify(result))
  }

  // 新增年份
  async setDevelopmentYear(info) {
    const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
    const result = await this.app.mysql.insert(
      'development_year_table',
      newInfo,
    )
    if (result.affectedRows !== 1) {
      return false
    }
    const list = await this.app.mysql.query(
      'select * from development_year_table order by id desc limit 1',
    )

    return JSON.parse(JSON.stringify(list))[0]
  }

  // 删除年份
  async deleteDevelopmentYear(pmCode) {
    const options = {
      where: {
        pm_code: pmCode,
      },
    }
    const result = await this.app.mysql.update(
      'development_year_table',
      { deleted: 1 },
      options,
    )
    return result.affectedRows === 1
  }

  // 获取发展历程年份
  async getDevelopmentYear() {
    const option = {
      columns: ['pm_code', 'year'],
      where: {
        deleted: 0,
      },
      orders: [['year', 'desc']],
    }
    return (await this.app.mysql.select('development_year_table', option)) || []
  }

  // 获取发展年份事件
  async getDevelopmentEvent(year_pm_code) {
    const option = {
      columns: ['pm_code', 'month', 'event'],
      where: {
        deleted: 0,
        year_pm_code,
      },
      orders: [['index', 'asc']],
    }
    return (
      (await this.app.mysql.select('development_event_table', option)) || []
    )
  }

  // 编辑 新增发展年份事件
  async setDevelopmentEvent(info) {
    const { pm_code, month, event } = info
    if (pm_code) {
      // 编辑
      const options = {
        where: {
          pm_code,
        },
      }
      const newInfo = await this.ctx.service.fillUtil.fillModifyRecord(info)
      const result = await this.app.mysql.update(
        'development_event_table',
        newInfo,
        options,
      )
      return result.affectedRows === 1
    }
    if (!pm_code) {
      // 新增
      const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
      const result = await this.app.mysql.insert(
        'development_event_table',
        newInfo,
      )
      return result.affectedRows === 1
    }
  }

  // 查询当天的ip是不是已经存过
  async queryHasStatistical(info) {
    const result = await this.app.mysql.get('statistical_table', {
      ...info,
      deleted: 0,
    })

    return JSON.parse(JSON.stringify(result))
  }

  // 记录统计
  async setStatistical(info) {
    const result = await this.app.mysql.insert('statistical_table', {
      ...info,
      deleted: 0,
    })

    return result.affectedRows === 1
  }

  // 获取统计
  async getStatistical(info) {
    const { type_one, type_two, type_three } = info
    let sqlWhere = 'deleted = 0'
    if (type_one) {
      sqlWhere += ` and type_one='${type_one}'`
    }
    if (type_two) {
      sqlWhere += ` and type_two='${type_two}'`
    }
    if (type_three) {
      sqlWhere += ` and type_three='${type_three}'`
    }
    const total = await this.app.mysql.query(
      `select COUNT(1) as total FROM statistical_table where ${sqlWhere} `,
    )
    return JSON.parse(JSON.stringify(total))[0].total
  }

  // 获取统计
  async getStatisticalAll({ type_one, type_two, type_three }) {
    const list = await this.app.mysql.query(
      `select type_two,COUNT(*) as number FROM statistical_table where deleted = '0' and type_one = '${type_one}' group by type_two`,
    )
    return list.map((info) => {
      return {
        number: info.number,
        typeTwo: info.type_two,
      }
    })
  }

  // 预约演示
  async setDemonstrate(info) {
    const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
    const result = await this.app.mysql.insert('demonstrate_table', newInfo)

    return result.affectedRows === 1
  }

  // 查询手机号是否提交过
  async queryDemonstrate(phone) {
    const result = await this.app.mysql.get('demonstrate_table', {
      phone,
      deleted: 0,
    })

    return JSON.parse(JSON.stringify(result))
  }

  // 预约演示列表
  async getDemonstrateList({
    phone,
    is_deal,
    current = 1,
    pageSize = 10,
    deal_result,
    startTime,
    endTime,
  }) {
    let sqlWhere = 'deleted = 0'

    const where = {
      deleted: 0,
    }

    const columns = [
      'pm_code',
      'name',
      'phone',
      'position',
      'company_name',
      'company_address',
      'industry',
      'is_deal',
      'create_time',
      'deal_result',
    ]

    if (phone) {
      where.phone = phone
      sqlWhere += ` and phone='${phone}'`
    }

    if (is_deal) {
      where.is_deal = is_deal
      sqlWhere += ` and is_deal='${is_deal}'`
    }

    if (deal_result) {
      where.deal_result = deal_result
      sqlWhere += ` and deal_result='${deal_result}'`
    }

    if (startTime) {
      sqlWhere += ` and create_time >='${startTime}'`
    }
    if (endTime) {
      sqlWhere += ` and create_time <='${endTime}'`
    }

    const option = {
      columns,
      where,
      orders: [['create_time', 'desc']],
      limit: Number(pageSize), // 返回数据量
      offset: (Number(current) - 1) * Number(pageSize), // 数据偏移量
    }

    const list =
      (await this.app.mysql.query(
        `select * FROM demonstrate_table where ${sqlWhere}`,
        option,
      )) || []
    const total = await this.app.mysql.query(
      `select COUNT(1) as total FROM demonstrate_table where ${sqlWhere} `,
    )

    return {
      total: JSON.parse(JSON.stringify(total))[0].total,
      list: list,
    }
  }

  // 处理预约演示
  async dealDemonstrate(pmCode, deal_result) {
    const options = {
      where: {
        pm_code: pmCode,
      },
    }
    const result = await this.app.mysql.update(
      'demonstrate_table',
      { is_deal: '1', deal_result },
      options,
    )
    return result.affectedRows === 1
  }

  // 合作伙伴
  async setPartner(info) {
    const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
    const result = await this.app.mysql.insert('partner_table', newInfo)

    return result.affectedRows === 1
  }

  // 合作伙伴列表
  async getPartnerList({
    phone,
    is_deal,
    current = 1,
    pageSize = 10,
    deal_result,
    startTime,
    endTime,
  }) {
    let sqlWhere = 'deleted = 0'

    const where = {
      deleted: 0,
    }

    const columns = [
      'pm_code',
      'name',
      'phone',
      'position',
      'company_name',
      'company_phone',
      'is_deal',
      'create_time',
      'deal_result',
    ]

    if (phone) {
      where.phone = phone
      sqlWhere += ` and phone='${phone}'`
    }

    if (is_deal) {
      where.is_deal = is_deal
      sqlWhere += ` and is_deal='${is_deal}'`
    }

    if (deal_result) {
      where.deal_result = deal_result
      sqlWhere += ` and deal_result='${deal_result}'`
    }

    if (startTime) {
      sqlWhere += ` and create_time >='${startTime}'`
    }
    if (endTime) {
      sqlWhere += ` and create_time <='${endTime}'`
    }

    const option = {
      columns,
      where,
      orders: [['create_time', 'desc']],
      limit: Number(pageSize), // 返回数据量
      offset: (Number(current) - 1) * Number(pageSize), // 数据偏移量
    }

    const list =
      (await this.app.mysql.query(
        `select * FROM partner_table where ${sqlWhere}`,
        option,
      )) || []
    const total = await this.app.mysql.query(
      `select COUNT(1) as total FROM partner_table where ${sqlWhere} `,
    )

    return {
      total: JSON.parse(JSON.stringify(total))[0].total,
      list: list,
    }
  }

  // 处理合作伙伴
  async dealPartner(pmCode, deal_result) {
    const options = {
      where: {
        pm_code: pmCode,
      },
    }
    const result = await this.app.mysql.update(
      'partner_table',
      { is_deal: '1', deal_result },
      options,
    )
    return result.affectedRows === 1
  }

  // 查询手机号是否提交过
  async queryPartner(phone) {
    const result = await this.app.mysql.get('partner_table', {
      phone,
      deleted: 0,
    })

    return JSON.parse(JSON.stringify(result))
  }

  // 试用申请
  async setTrial(info) {
    const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
    const result = await this.app.mysql.insert('trial_table', newInfo)

    return result.affectedRows === 1
  }

  // 试用申请列表
  async getTrialList({
    phone,
    is_deal,
    current = 1,
    pageSize = 10,
    deal_result,
    startTime,
    endTime,
  }) {
    let sqlWhere = 'deleted = 0'

    const where = {
      deleted: 0,
    }

    const columns = [
      'pm_code',
      'name',
      'phone',
      'position',
      'company_name',
      'company_size',
      'email',
      'is_deal',
      'create_time',
      'deal_result',
    ]

    if (phone) {
      where.phone = phone
      sqlWhere += ` and phone='${phone}'`
    }

    if (is_deal) {
      where.is_deal = is_deal
      sqlWhere += ` and is_deal='${is_deal}'`
    }

    if (deal_result) {
      where.deal_result = deal_result
      sqlWhere += ` and deal_result='${deal_result}'`
    }

    if (startTime) {
      sqlWhere += ` and create_time >='${startTime}'`
    }
    if (endTime) {
      sqlWhere += ` and create_time <='${endTime}'`
    }

    const option = {
      columns,
      where,
      orders: [['create_time', 'desc']],
      limit: Number(pageSize), // 返回数据量
      offset: (Number(current) - 1) * Number(pageSize), // 数据偏移量
    }

    const list =
      (await this.app.mysql.query(
        `select * FROM trial_table where ${sqlWhere}`,
        option,
      )) || []
    const total = await this.app.mysql.query(
      `select COUNT(1) as total FROM trial_table where ${sqlWhere} `,
    )

    return {
      total: JSON.parse(JSON.stringify(total))[0].total,
      list: list,
    }
  }

  // 查询手机号是否提交过
  async queryTrial(phone) {
    const result = await this.app.mysql.get('trial_table', {
      phone,
      deleted: 0,
    })

    return JSON.parse(JSON.stringify(result))
  }

  // 处理试用申请
  async dealTrial(pmCode, deal_result) {
    const options = {
      where: {
        pm_code: pmCode,
      },
    }
    const result = await this.app.mysql.update(
      'trial_table',
      { is_deal: '1', deal_result },
      options,
    )
    return result.affectedRows === 1
  }

  // 增加tag
  async setTags(relation_pm_code, data = [], type) {
    const options = {
      where: {
        relation_pm_code,
      },
    }
    await this.app.mysql.delete('tags_table', { relation_pm_code })
    return Promise.all(
      data.map(async (info) => {
        const newInfo = await this.ctx.service.fillUtil.fillNewRecord({
          relation_pm_code,
          text: info,
          type,
        })
        return await this.app.mysql.insert('tags_table', newInfo)
      }),
    ).then(() => {
      return true
    })
  }

  // relation_pm_code获取tag
  async getTags(relation_pm_code) {
    const where = {
      deleted: 0,
      relation_pm_code,
    }
    const option = {
      columns: ['text'],
      where,
    }

    const result = (await this.app.mysql.select('tags_table', option)) || []
    return JSON.parse(JSON.stringify(result))
  }

  // text获取tag
  async getTagsText(text) {
    const where = {
      deleted: 0,
      text,
      type: 'video',
    }
    const option = {
      columns: ['relation_pm_code'],
      where,
    }

    const result = (await this.app.mysql.select('tags_table', option)) || []
    return JSON.parse(JSON.stringify(result))
  }

  // 新建和编辑Banner
  async setBanner(info) {
    const { img_pm_code, pm_code, sorting, state, type, note } = info
    if (pm_code) {
      // 编辑
      const options = {
        where: {
          pm_code,
        },
      }
      const newInfo = await this.ctx.service.fillUtil.fillModifyRecord(info)
      const result = await this.app.mysql.update(
        'banner_table',
        newInfo,
        options,
      )
      return result.affectedRows === 1
    }
    if (!pm_code) {
      // 新增
      const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
      const result = await this.app.mysql.insert('banner_table', newInfo)
      return result.affectedRows === 1
    }
  }

  // 获取Banner列表
  async getBanner({ type, current = 1, pageSize = 10 }) {
    let sqlWhere = 'deleted = 0'

    const where = {
      deleted: 0,
    }

    const columns = [
      'pm_code',
      'img_pm_code',
      'state',
      'sorting',
      'type',
      'note',
    ]

    if (type) {
      where.type = type
      sqlWhere += ` and type='${type}'`
    }

    const option = {
      columns,
      where,
      orders: [['type', 'asc']],
      limit: Number(pageSize), // 返回数据量
      offset: (Number(current) - 1) * Number(pageSize), // 数据偏移量
    }
    const list = (await this.app.mysql.select('banner_table', option)) || []
    const total = await this.app.mysql.query(
      `select COUNT(1) as total FROM banner_table where ${sqlWhere} `,
    )

    return {
      total: JSON.parse(JSON.stringify(total))[0].total,
      list: JSON.parse(JSON.stringify(list)),
    }
  }

  // 删除Banner
  async deleteBanner(pmCode) {
    const options = {
      where: {
        pm_code: pmCode,
      },
    }
    const result = await this.app.mysql.update(
      'banner_table',
      { deleted: 1 },
      options,
    )
    return result.affectedRows === 1
  }

  // 获取Banner得到详情
  async getBannerDetail(pmCode) {
    const option = {
      where: {
        pm_code: pmCode,
      },
      columns: ['pm_code', 'img_pm_code', 'type', 'state', 'note', 'sorting'],
    }
    const result = (await this.app.mysql.select('banner_table', option)) || []
    return JSON.parse(JSON.stringify(result))[0]
  }

  // 获取官网Banner
  async getBannerArray(type) {
    const where = {
      deleted: 0,
      type,
      state: 1,
    }

    const columns = ['img_pm_code']

    const option = {
      columns,
      where,
      orders: [['sorting', 'asc']],
    }
    const list = (await this.app.mysql.select('banner_table', option)) || []

    return JSON.parse(JSON.stringify(list))
  }

  // 登录
  async login({ username, password }) {
    const result = await this.app.mysql.get('user_table', {
      username,
      password,
      deleted: 0,
    })

    return JSON.parse(JSON.stringify(result))
  }

  // 获取菜单
  async getMenuArray() {
    const where = {
      deleted: 0,
    }

    const columns = ['name', 'permission']

    const option = {
      columns,
      where,
    }
    const list = (await this.app.mysql.select('menu_table', option)) || []

    return JSON.parse(JSON.stringify(list))
  }

  // 查询用户名是否存在
  async queryUserName(username) {
    const result = await this.app.mysql.get('user_table', {
      username,
      deleted: 0,
    })

    return JSON.parse(JSON.stringify(result))
  }

  // 新建和编辑用户
  async setUser(info) {
    if (info.pm_code) {
      // 编辑
      const options = {
        where: {
          pm_code: info.pm_code,
          deleted: 0,
        },
      }
      const newInfo = await this.ctx.service.fillUtil.fillModifyRecord(info)
      const result = await this.app.mysql.update('user_table', newInfo, options)
      return result.affectedRows === 1
    }
    if (!info.pm_code) {
      // 新增
      const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
      const result = await this.app.mysql.insert('user_table', newInfo)
      return result.affectedRows === 1
    }
  }

  // 查询用户信息
  async queryUserInfo(pm_code) {
    const result = await this.app.mysql.get('user_table', {
      pm_code,
      deleted: 0,
    })

    return JSON.parse(JSON.stringify(result))
  }

  // 用户列表
  async getUserList({ username, current = 1, pageSize = 10, department }) {
    let sqlWhere = 'deleted = 0'

    const where = {
      deleted: 0,
    }

    const columns = ['pm_code', 'username', 'name', 'create_time', 'department']

    if (username) {
      where.username = username
      sqlWhere += ` and username='${username}'`
    }

    if (department) {
      where.department = department
      sqlWhere += ` and department='${department}'`
    }

    const option = {
      columns,
      where,
      orders: [['create_time', 'desc']],
      limit: Number(pageSize), // 返回数据量
      offset: (Number(current) - 1) * Number(pageSize), // 数据偏移量
    }

    const list = (await this.app.mysql.select('user_table', option)) || []
    const total = await this.app.mysql.query(
      `select COUNT(1) as total FROM user_table where ${sqlWhere} `,
    )

    return {
      total: JSON.parse(JSON.stringify(total))[0].total,
      list,
    }
  }

  // 获取用户详情
  async getUserDetail(pmCode) {
    const option = {
      where: {
        pm_code: pmCode,
      },
      columns: [
        'pm_code',
        'name',
        'username',
        'password',
        'permissions',
        'department',
      ],
    }
    const result = (await this.app.mysql.select('user_table', option)) || []
    return JSON.parse(JSON.stringify(result))[0]
  }

  // 删除用户
  async deleteUser(pmCode) {
    const options = {
      where: {
        pm_code: pmCode,
      },
    }
    const result = await this.app.mysql.update(
      'user_table',
      { deleted: 1 },
      options,
    )
    return result.affectedRows === 1
  }

  // 新建和编辑新闻
  async setNewsDetail(info, tags) {
    const {
      title,
      auth,
      text,
      seo,
      index_recommended,
      type,
      pm_code,
      introduce,
      number,
      release_time,
    } = info
    if (pm_code) {
      // 编辑
      const options = {
        where: {
          pm_code,
        },
      }
      const newInfo = await this.ctx.service.fillUtil.fillModifyRecord(info)
      const result = await this.app.mysql.update('news_table', newInfo, options)
      await this.setTags(pm_code, tags, 'news')
      return result.affectedRows === 1
    }
    if (!pm_code) {
      // 新增
      const newInfo = await this.ctx.service.fillUtil.fillNewRecord(info)
      const result = await this.app.mysql.insert('news_table', newInfo)
      const value = await this.app.mysql.query(`
      select pm_code from news_table where id in (select max(id) from news_table  where deleted=0 )
      `)
      const newPmCode = JSON.parse(JSON.stringify(value))[0].pm_code
      await this.setTags(newPmCode, tags, 'news')
      return result.affectedRows === 1
    }
  }

  // 获取新闻详情
  async getNewsDetail(pmCode) {
    const option = {
      where: {
        pm_code: pmCode,
      },
      columns: [
        'id',
        'title',
        'auth',
        'text',
        'seo',
        'index_recommended',
        'type',
        'pm_code',
        'introduce',
        'img_pm_code',
        'number',
        'create_time',
        'release_time',
      ],
    }
    const result = (await this.app.mysql.select('news_table', option)) || []
    return JSON.parse(JSON.stringify(result))[0]
  }

  // 获取新闻列表
  async getNewsList({
    title,
    type,
    index_recommended,
    current = 1,
    pageSize = 10,
    startTime,
    endTime,
  }) {
    let sqlWhere = 'deleted = 0'

    const where = {
      deleted: 0,
    }

    const columns = [
      'title',
      'auth',
      'seo',
      'index_recommended',
      'type',
      'pm_code',
      'introduce',
      'img_pm_code',
      'number',
      'create_time',
    ]

    if (title) {
      where.title = title
      sqlWhere += ` and title='${title}'`
    }
    if (type) {
      where.type = type
      sqlWhere += ` and type='${type}'`
    }
    if (index_recommended) {
      where.index_recommended = index_recommended
      sqlWhere += ` and index_recommended='${index_recommended}'`
    }

    if (startTime) {
      sqlWhere += ` and release_time >='${startTime}'`
    }
    if (endTime) {
      sqlWhere += ` and release_time <='${endTime}'`
    }

    const option = {
      columns,
      where,
      orders: [['create_time', 'desc']],
      limit: Number(pageSize), // 返回数据量
      offset: (Number(current) - 1) * Number(pageSize), // 数据偏移量
    }
    sqlWhere += ` order by create_time desc limit ${
      (Number(current) - 1) * Number(pageSize)
    },${Number(pageSize)}`

    const list =
      (await this.app.mysql.query(
        `select * FROM news_table where ${sqlWhere} `,
      )) || []
    const total = await this.app.mysql.query(
      `select COUNT(1) as total FROM news_table where ${sqlWhere} `,
    )

    return {
      total: JSON.parse(JSON.stringify(total))[0].total,
      list: JSON.parse(JSON.stringify(list)),
    }
  }

  // 删除新闻
  async deleteNews(pmCode) {
    const options = {
      where: {
        pm_code: pmCode,
      },
    }
    const result = await this.app.mysql.update(
      'news_table',
      { deleted: 1 },
      options,
    )
    return result.affectedRows === 1
  }

  // 获取上一篇下一篇
  async getLastNext(id, type) {
    const next = await this.app.mysql.query(
      `select pm_code as pmCode,title from news_table where id<${id} and deleted = 0 and type=${type} order by id desc limit 0,1`,
    )
    const last = await this.app.mysql.query(
      `select pm_code as pmCode,title from news_table where id>${id} and deleted = 0 and type=${type} order by id asc limit 0,1`,
    )

    return {
      last: JSON.parse(JSON.stringify(last))[0],
      next: JSON.parse(JSON.stringify(next))[0],
    }
  }

  // 新闻看过人数加1
  async newsAddNumber(pmCode) {
    const result = await this.app.mysql.query(
      `update news_table set number=number+1 where pm_code='${pmCode}'`,
    )

    return result
  }

  // 新闻相关推荐
  async relatedRecommend(tags) {
    if (tags.length === 0) {
      return []
    }
    let sqlWhere = `deleted = 0 and type = 'news'`
    for (let i = 0; i < tags.length; i++) {
      if (i === 0) {
        sqlWhere += ` and (text = '${tags[i].text}'`
      }
      if (i > 0) {
        sqlWhere += ` or text = '${tags[i].text}'`
      }
      if (i === tags.length - 1) {
        sqlWhere += `)`
      }
    }
    sqlWhere += ` order by create_time asc `

    const result = await this.app.mysql.query(
      `select * FROM tags_table where ${sqlWhere} `,
    )

    return JSON.parse(JSON.stringify(result))
  }
}
module.exports = WebService
