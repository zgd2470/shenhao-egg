/* eslint-disable no-dupe-class-members */
/* eslint-disable no-mixed-spaces-and-tabs */
'use strict'
// node.js 文件操作对象
const fs = require('mz/fs')
// node.js 路径操作对象
const path = require('path')
// egg.js Controller
const Controller = require('egg').Controller
// 故名思意 异步二进制 写入流
const awaitWriteStream = require('await-stream-ready').write
// 管道读入一个虫洞。
const sendToWormhole = require('stream-wormhole')
// 当然你也可以不使用这个 哈哈 个人比较赖
// 还有我们这里使用了egg-multipart
const md5 = require('md5')

const xlsx = require('xlsx')
const moment = require('moment')
const myPicPath = './app/public/pic'
const myExcelPath = './app/public/uploads'

const typeEnum = {
  goods: '0', // 实物
  discount: '1', // 优惠券
}

// eslint-disable-next-line no-unused-vars
class FileController extends Controller {
  async create() {
    // 获取文件流
    const { ctx } = this
    const { filepath, filename } = ctx.request.files[0]

    if (!fs.existsSync(myPicPath)) {
      fs.mkdirSync(myPicPath)
    }

    // const stream = await this.ctx.getFileStream();
    if (!filename) {
      //注意如果没有传入图片直接返回
      return
    }
    // 定义文件名
    // eslint-disable-next-line no-undef
    const filenameBy = Date.now() + path.extname(filename).toLocaleLowerCase()
    // 目标文件
    // eslint-disable-next-line no-undef
    const target = path.join(myPicPath, filenameBy)

    try {
      // 异步把文件流 写入
      // eslint-disable-next-line no-undef
      // 读取文件
      const file = fs.readFileSync(filepath) //files[0]表示获取第一个文件，若前端上传多个文件则可以遍历这个数组对象

      // 将文件存到指定位置
      fs.writeFileSync(path.join('', target), file)

      // await ctx.oss.put(filename, filepath);
    } catch (err) {
      // 如果出现错误，关闭管道
      // eslint-disable-next-line no-undef
      await sendToWormhole(filepath)
    }
    // 自定义方法
    // this.success({ url: '/public/uploads/' + filename });
    const info = await this.ctx.service.fileService.save(target, filename)

    // eslint-disable-next-line no-undef
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: info,
    } // 返回体
  }

  async index() {
    const ctx = this.ctx
    // egg-multipart 已经帮我们处理文件二进制对象
    // node.js 和 php 的上传唯一的不同就是 ，php 是转移一个 临时文件
    // node.js 和 其他语言（java c#） 一样操作文件流
    const stream = await ctx.getFileStream()
    // 新建一个文件名
    const filename =
      md5(stream.filename) + path.extname(stream.filename).toLocaleLowerCase()
    // 文件生成绝对路径
    // 当然这里这样市不行的，因为你还要判断一下是否存在文件路径
    const target = path.join(
      //   this.config.baseDir,
      myPicPath,
      filename,
    )
    // 生成一个文件写入 文件流
    const writeStream = fs.createWriteStream(target)
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream))
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream)
      throw err
    }
    // 文件响应
    ctx.body = {
      url: myPicPath + filename,
    }
  }

  // 处理文件下载
  async download() {
    const pmCode = this.ctx.params.pmCode

    const result = await this.ctx.service.fileService.getFilePath(pmCode)
    this.ctx.attachment(result.file_name)
    this.ctx.set('Content-Type', 'application/octet-stream')
    this.ctx.body = fs.createReadStream(result.file_path)
  }

  // 批量预约演示导出
  async batchExportDemonstrate() {
    const { query } = this.ctx.request
    const { pmCodes = '' } = query
    return Promise.all(
      pmCodes.split(',').map(async (info) => {
        return await this.ctx.service.webService.getDemonstrateDetail(info)
      }),
    ).then(async (result) => {
      const newResult = result.map((info) => {
        return {
          name: info.name,
          phone: info.phone,
          position: info.position,
          company_name: info.company_name,
          company_address: info.company_address,
          industry: info.industry,
          create_time: info.create_time
            ? moment(info.create_time).format('YYYY-MM-DD HH:mm:ss')
            : '',
          deal_result: info.deal_result,

          is_deal: Number(info.is_deal) === 0 ? '未处理' : '已处理',
        }
      })
      const header = {
        name: '姓名',
        phone: '手机号',
        position: '职务',
        company_name: '公司名称',
        company_address: '公司地址',
        industry: '归属',
        create_time: '提交时间',
        is_deal: '状态',
        deal_result: '处理结果',
      }
      this.exportXLSX('预约演示名单', '预约演示名单', header, newResult)
    })
  }

  // 批量预约演示导出
  async batchExportPartner() {
    const { query } = this.ctx.request
    const { pmCodes = '' } = query
    return Promise.all(
      pmCodes.split(',').map(async (info) => {
        return await this.ctx.service.webService.getPartnerDetail(info)
      }),
    ).then(async (result) => {
      const newResult = result.map((info) => {
        return {
          name: info.name,
          phone: info.phone,
          position: info.position,
          company_name: info.company_name,
          company_phone: info.company_phone,
          create_time: info.create_time
            ? moment(info.create_time).format('YYYY-MM-DD HH:mm:ss')
            : '',
          deal_result: info.deal_result,

          is_deal: Number(info.is_deal) === 0 ? '未处理' : '已处理',
        }
      })
      const header = {
        name: '姓名',
        phone: '手机号',
        position: '职务',
        company_name: '公司名称',
        company_phone: '公司电话',
        create_time: '提交时间',
        is_deal: '状态',
        deal_result: '处理结果',
      }
      this.exportXLSX('合作伙伴名单', '合作伙伴名单', header, newResult)
    })
  }

  // 批量试用申请导出
  async batchExportTrial() {
    const { query } = this.ctx.request
    const { pmCodes = '' } = query
    return Promise.all(
      pmCodes.split(',').map(async (info) => {
        return await this.ctx.service.webService.getTrialDetail(info)
      }),
    ).then(async (result) => {
      const newResult = result.map((info) => {
        return {
          name: info.name,
          phone: info.phone,
          position: info.position,
          company_name: info.company_name,
          company_size: info.company_size,
          email: info.email,
          create_time: info.create_time
            ? moment(info.create_time).format('YYYY-MM-DD HH:mm:ss')
            : '',
          deal_result: info.deal_result,

          is_deal: Number(info.is_deal) === 0 ? '未处理' : '已处理',
        }
      })
      const header = {
        name: '姓名',
        phone: '手机号',
        position: '职务',
        company_name: '公司名称',
        company_size: '公司规模',
        email: '邮箱',
        create_time: '提交时间',
        is_deal: '状态',
        deal_result: '处理结果',
      }
      this.exportXLSX('试用申请名单', '试用申请名单', header, newResult)
    })
  }

  // 批量预约演示导出搜索
  async batchExportSearchDemonstrate() {
    const { query } = this.ctx.request
    const { phone, isDeal, dealResult, startTime = '', endTime = '' } = query

    const data = await this.ctx.service.webService.getDemonstrateListAll({
      phone,
      is_deal: isDeal,
      deal_result: dealResult,
      startTime,
      endTime,
    })

    const newResult = data.map((info) => {
      return {
        name: info.name,
        phone: info.phone,
        position: info.position,
        company_name: info.company_name,
        company_address: info.company_address,
        industry: info.industry,
        create_time: info.create_time
          ? moment(info.create_time).format('YYYY-MM-DD HH:mm:ss')
          : '',
        deal_result: info.deal_result,

        is_deal: Number(info.is_deal) === 0 ? '未处理' : '已处理',
      }
    })

    const header = {
      name: '姓名',
      phone: '手机号',
      position: '职务',
      company_name: '公司名称',
      company_address: '公司地址',
      industry: '归属',
      create_time: '提交时间',
      is_deal: '状态',
      deal_result: '处理结果',
    }
    this.exportXLSX('预约演示名单', '预约演示名单', header, newResult)
  }

  // 批量合作伙伴导出搜索
  async batchExportSearchPartner() {
    const { query } = this.ctx.request
    const { phone, isDeal, dealResult, startTime = '', endTime = '' } = query

    const data = await this.ctx.service.webService.getPartnerListAll({
      phone,
      is_deal: isDeal,
      deal_result: dealResult,
      startTime,
      endTime,
    })

    const newResult = data.map((info) => {
      return {
        name: info.name,
        phone: info.phone,
        position: info.position,
        company_name: info.company_name,
        company_phone: info.company_phone,
        create_time: info.create_time
          ? moment(info.create_time).format('YYYY-MM-DD HH:mm:ss')
          : '',
        deal_result: info.deal_result,

        is_deal: Number(info.is_deal) === 0 ? '未处理' : '已处理',
      }
    })

    const header = {
      name: '姓名',
      phone: '手机号',
      position: '职务',
      company_name: '公司名称',
      company_phone: '公司电话',
      create_time: '提交时间',
      is_deal: '状态',
      deal_result: '处理结果',
    }
    this.exportXLSX('合作伙伴名单', '合作伙伴名单', header, newResult)
  }

  // 批量试用申请导出搜索
  async batchExportSearchTrial() {
    const { query } = this.ctx.request
    const { phone, isDeal, dealResult, startTime = '', endTime = '' } = query

    const data = await this.ctx.service.webService.getTrialListAll({
      phone,
      is_deal: isDeal,
      deal_result: dealResult,
      startTime,
      endTime,
    })

    const newResult = data.map((info) => {
      return {
        name: info.name,
        phone: info.phone,
        position: info.position,
        company_name: info.company_name,
        company_size: info.company_size,
        email: info.email,
        create_time: info.create_time
          ? moment(info.create_time).format('YYYY-MM-DD HH:mm:ss')
          : '',
        deal_result: info.deal_result,

        is_deal: Number(info.is_deal) === 0 ? '未处理' : '已处理',
      }
    })

    const header = {
      name: '姓名',
      phone: '手机号',
      position: '职务',
      company_name: '公司名称',
      company_size: '公司规模',
      email: '邮箱',
      create_time: '提交时间',
      is_deal: '状态',
      deal_result: '处理结果',
    }
    this.exportXLSX('试用申请名单', '试用申请名单', header, newResult)
  }

  // excel表格下载
  async exportXLSX(fileName, sheetName, header, data) {
    // 生成workbook
    const workbook = xlsx.utils.book_new()
    // 插入表头
    const headerData = [header]

    data.forEach((info) => {
      headerData.push(info)
    })

    // 生成worksheet
    const worksheet = xlsx.utils.json_to_sheet(headerData, {
      skipHeader: true,
    })
    // 组装
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName)

    // 返回数据流
    // @ts-ignore
    this.ctx.set('Content-Type', 'application/vnd.openxmlformats')
    // @ts-ignore
    this.ctx.set(
      'Content-Disposition',
      "attachment;filename*=UTF-8' '" + encodeURIComponent(fileName) + '.xlsx',
    )
    // @ts-ignore
    this.ctx.body = await xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    })
  }
}

// eslint-disable-next-line no-undef
module.exports = FileController
