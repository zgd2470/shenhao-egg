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

  // TODO：登录写死
  async login() {
    const { body = {} } = this.ctx.request
    const { username, password } = body
    const passwordArray = [
      '8914de686ab28dc22f30d3d8e107ff6c',
      '21232f297a57a5a743894a0e4a801fc3',
    ]
    if (username === 'admin' && passwordArray.includes(password)) {
      this.ctx.body = {
        success: true,
        message: '操作成功',
        code: 200,
        result: {
          avatar:
            'https://gw.alipayobjects.com/zos/rmsportal/jZUIxmJycoymBprLOUbT.png',
          createTime: 1497160610259,
          creatorId: 'admin',
          deleted: 0,
          id: '77e8bD95-881E-91ce-d3D3-f18Ac398Ddc5',
          lang: 'zh-CN',
          lastLoginIp: '27.154.74.117',
          lastLoginTime: 1534837621348,
          name: 'Shirley Taylor',
          password: '',
          roleId: 'admin',
          status: 1,
          telephone: '',
          token: '4291d7da9005377ec9aec4a71ea837f',
          username: 'admin',
        },
      }
      return
    }

    this.ctx.body = {
      success: false,
      message: '账户或密码错误',
      code: 401,
      result: {
        isLogin: true,
      },
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

  // TODO：个人信息写死
  async userInfo() {
    const {} = this.ctx.request
    const userInfo = {
      id: '4291d7da9005377ec9aec4a71ea837f',
      name: '天野远子',
      username: 'admin',
      password: '',
      avatar: '/avatar2.jpg',
      status: 1,
      telephone: '',
      lastLoginIp: '27.154.74.117',
      lastLoginTime: 1534837621348,
      creatorId: 'admin',
      createTime: 1497160610259,
      merchantCode: 'TLif2btpzg079h15bk',
      deleted: 0,
      roleId: 'admin',
      role: {},
    }
    // role
    const roleObj = {
      id: 'admin',
      name: '管理员',
      describe: '拥有所有权限',
      status: 1,
      creatorId: 'system',
      createTime: 1497160610259,
      deleted: 0,
      permissions: [
        {
          roleId: 'admin',
          permissionId: 'dashboard',
          permissionName: '仪表盘',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'query',
              describe: '查询',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
            {
              action: 'delete',
              describe: '删除',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
        {
          roleId: 'admin',
          permissionId: 'exception',
          permissionName: '异常页面权限',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'query',
              describe: '查询',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
            {
              action: 'delete',
              describe: '删除',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
        {
          roleId: 'admin',
          permissionId: 'result',
          permissionName: '结果权限',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'query',
              describe: '查询',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
            {
              action: 'delete',
              describe: '删除',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
        {
          roleId: 'admin',
          permissionId: 'profile',
          permissionName: '详细页权限',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'query',
              describe: '查询',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
            {
              action: 'delete',
              describe: '删除',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
        {
          roleId: 'admin',
          permissionId: 'table',
          permissionName: '表格权限',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"import","defaultCheck":false,"describe":"导入"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'import',
              describe: '导入',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
        {
          roleId: 'admin',
          permissionId: 'form',
          permissionName: '表单权限',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'query',
              describe: '查询',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
            {
              action: 'delete',
              describe: '删除',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
        {
          roleId: 'admin',
          permissionId: 'order',
          permissionName: '订单管理',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'query',
              describe: '查询',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
            {
              action: 'delete',
              describe: '删除',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
        {
          roleId: 'admin',
          permissionId: 'permission',
          permissionName: '权限管理',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
            {
              action: 'delete',
              describe: '删除',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
        {
          roleId: 'admin',
          permissionId: 'role',
          permissionName: '角色管理',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
            {
              action: 'delete',
              describe: '删除',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
        {
          roleId: 'admin',
          permissionId: 'table',
          permissionName: '桌子管理',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'query',
              describe: '查询',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
            {
              action: 'delete',
              describe: '删除',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
        {
          roleId: 'admin',
          permissionId: 'user',
          permissionName: '用户管理',
          actions:
            '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"import","defaultCheck":false,"describe":"导入"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"},{"action":"export","defaultCheck":false,"describe":"导出"}]',
          actionEntitySet: [
            {
              action: 'add',
              describe: '新增',
              defaultCheck: false,
            },
            {
              action: 'import',
              describe: '导入',
              defaultCheck: false,
            },
            {
              action: 'get',
              describe: '详情',
              defaultCheck: false,
            },
            {
              action: 'update',
              describe: '修改',
              defaultCheck: false,
            },
            {
              action: 'delete',
              describe: '删除',
              defaultCheck: false,
            },
            {
              action: 'export',
              describe: '导出',
              defaultCheck: false,
            },
          ],
          actionList: null,
          dataAccess: null,
        },
      ],
    }

    roleObj.permissions.push({
      roleId: 'admin',
      permissionId: 'support',
      permissionName: '超级模块',
      actions:
        '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"import","defaultCheck":false,"describe":"导入"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"},{"action":"export","defaultCheck":false,"describe":"导出"}]',
      actionEntitySet: [
        {
          action: 'add',
          describe: '新增',
          defaultCheck: false,
        },
        {
          action: 'import',
          describe: '导入',
          defaultCheck: false,
        },
        {
          action: 'get',
          describe: '详情',
          defaultCheck: false,
        },
        {
          action: 'update',
          describe: '修改',
          defaultCheck: false,
        },
        {
          action: 'delete',
          describe: '删除',
          defaultCheck: false,
        },
        {
          action: 'export',
          describe: '导出',
          defaultCheck: false,
        },
      ],
      actionList: null,
      dataAccess: null,
    })

    userInfo.role = roleObj

    this.ctx.body = {
      success: true,
      message: '',
      code: 0,
      result: userInfo,
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
        createTime: moment(info.create_time).format('YYYY-MM-DD HH:mm:ss'),
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
}

// eslint-disable-next-line no-undef
module.exports = CustomController
