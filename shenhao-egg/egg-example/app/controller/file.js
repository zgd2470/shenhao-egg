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
}

// eslint-disable-next-line no-undef
module.exports = FileController
