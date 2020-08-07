/* eslint-disable no-dupe-class-members */
/* eslint-disable no-mixed-spaces-and-tabs */
'use strict';
// node.js 文件操作对象
const fs = require('mz/fs');
// node.js 路径操作对象
const path = require('path');
// egg.js Controller
const Controller = require('egg').Controller;
// 故名思意 异步二进制 写入流
const awaitWriteStream = require('await-stream-ready').write;
// 管道读入一个虫洞。
const sendToWormhole = require('stream-wormhole');
// 当然你也可以不使用这个 哈哈 个人比较赖
// 还有我们这里使用了egg-multipart
const md5 = require('md5');

const xlsx = require('xlsx');

const myPicPath = './app/public/pic';
const myExcelPath = './app/public/uploads';

const typeEnum = {
  goods: '0', // 实物
  discount: '1', // 优惠券
};

// eslint-disable-next-line no-unused-vars
class FileController extends Controller {
  async create() {
    // 获取文件流
    const { ctx } = this;
    const { filepath, filename } = ctx.request.files[0];

    if (!fs.existsSync(myPicPath)) {
      fs.mkdirSync(myPicPath);
    }

    // const stream = await this.ctx.getFileStream();
    if (!filename) {
      //注意如果没有传入图片直接返回
      return;
    }
    // 定义文件名
    // eslint-disable-next-line no-undef
    const filenameBy = Date.now() + path.extname(filename).toLocaleLowerCase();
    // 目标文件
    // eslint-disable-next-line no-undef
    const target = path.join(myPicPath, filenameBy);

    try {
      // 异步把文件流 写入
      // eslint-disable-next-line no-undef
      // 读取文件
      const file = fs.readFileSync(filepath); //files[0]表示获取第一个文件，若前端上传多个文件则可以遍历这个数组对象

      // 将文件存到指定位置
      fs.writeFileSync(path.join('', target), file);

      // await ctx.oss.put(filename, filepath);
    } catch (err) {
      // 如果出现错误，关闭管道
      // eslint-disable-next-line no-undef
      await sendToWormhole(filepath);
    }
    // 自定义方法
    // this.success({ url: '/public/uploads/' + filename });
    const info = await this.ctx.service.fileService.save(target, filename);

    // eslint-disable-next-line no-undef
    this.ctx.body = {
      success: true,
      message: '操作成功',
      data: info,
    }; // 返回体
  }

  async index() {
    const ctx = this.ctx;
    // egg-multipart 已经帮我们处理文件二进制对象
    // node.js 和 php 的上传唯一的不同就是 ，php 是转移一个 临时文件
    // node.js 和 其他语言（java c#） 一样操作文件流
    const stream = await ctx.getFileStream();
    // 新建一个文件名
    const filename =
      md5(stream.filename) + path.extname(stream.filename).toLocaleLowerCase();
    // 文件生成绝对路径
    // 当然这里这样市不行的，因为你还要判断一下是否存在文件路径
    const target = path.join(
      //   this.config.baseDir,
      myPicPath,
      filename,
    );
    // 生成一个文件写入 文件流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      throw err;
    }
    // 文件响应
    ctx.body = {
      url: myPicPath + filename,
    };
  }

  // 处理文件下载
  async download() {
    const pmCode = this.ctx.params.pmCode;

    const result = await this.ctx.service.fileService.getFilePath(pmCode);
    // this.ctx.attachment('test.xlsx');
    // this.ctx.set('Content-Type', 'application/octet-stream');
    this.ctx.attachment(result.file_name);
    this.ctx.set('Content-Type', 'application/octet-stream');

    this.ctx.body = fs.createReadStream(result.file_path);
  }

  // 中奖名单导入
  async import() {
    if (!fs.existsSync(myExcelPath)) {
      fs.mkdirSync(myExcelPath);
    }
    const { ctx } = this;
    //获取上传文件
    if (!ctx.request.files || !ctx.request.files.length) {
      this.ctx.body = {
        success: false,
        message: '请上传文件',
      };
      return;
    }
    const file = ctx.request.files[0];

    if (!file) return ctx.throw(404);
    //创建可读流
    const create_time = await this.ctx.service.data.getCurrentDate();
    const filename = create_time + ' ' + ctx.request.files[0].filename;
    if (
      path.extname(file.filename).toLowerCase() !== '.xlsx' &&
      path.extname(file.filename).toLowerCase() !== '.xls'
    ) {
      this.ctx.body = {
        success: false,
        message: '请上传正确的excel文件',
      };
      return;
    }
    const distPath = path.join(myExcelPath);
    const stat = fs.statSync(distPath);
    if (!stat.isDirectory()) {
      fs.mkdirSync(distPath);
    }
    const targetPath = path.join(
      //   this.config.baseDir,
      myExcelPath,
      filename,
    );
    try {
      //files[0]表示获取第一个文件，若前端上传多个文件则可以遍历这个数组对象
      const fileBy = fs.readFileSync(file.filepath);
      // 将文件存到指定位置
      fs.writeFileSync(path.join('', targetPath), fileBy);
      // await pump(source, target);
      ctx.logger.warn('SimCard will be save %s', targetPath);
    } finally {
      // delete those request tmp files
      await ctx.cleanupRequestFiles();
    }
    // 读取内容
    const workbook = xlsx.readFile(targetPath);
    // console.log(workbook)
    //获取表名
    const sheetNames = workbook.SheetNames;
    // console.log(sheetNames)
    //通过表名得到表对象
    const sheet = workbook.Sheets[sheetNames[0]];

    if (!sheet['!ref']) {
      this.ctx.body = {
        success: false,
        message: '文件内容为空',
      };
      return;
    }

    const keyList = Object.keys(sheet);

    const nowKeyList = [];

    keyList.forEach(info => {
      const value = info.replace(/[^0-9]/gi, '');
      if (Number(value) === 1) {
        nowKeyList.push(info);
      }
    });

    const thead = nowKeyList.map(info => {
      return sheet[info].v;
    });

    const data = xlsx.utils.sheet_to_json(sheet);

    const result = [];
    const newResult = [];

    for (let i = 0; i < data.length; i++) {
      let goods_size = '';
      let address = '';
      let award = '0';
      if (data[i][thead[9]]) {
        goods_size = data[i][thead[9]];
      }
      if (data[i][thead[10]]) {
        address = data[i][thead[10]];
      }
      if (data[i][thead[11]]) {
        award = data[i][thead[11]] === '未核销' ? '0' : '1';
      }

      const info = {
        title: data[i][thead[0]],
        activity_pm_code: data[i][thead[1]],
        goods_sku: data[i][thead[2]],
        user_pm_code: data[i][thead[4]],
        user_name: data[i][thead[5]],
        mobile_phone: data[i][thead[6]],
        level: data[i][thead[7]],
        is_score: data[i][thead[8]] === '分享' ? '0' : '1',
        goods_size,
        address,
        award,
        reward_type: '0',
        // address: data[i][thead[7]],
      };

      result.push(info);
    }

    const activityResultList = await this.ctx.service.weCharService.queryAllActivityList();
    let activityResult = '';

    activityResult = activityResultList[0];

    const filterList = activityResultList.filter(info => {
      return info.activity_state === '300' || info.activity_state === '400';
    });

    if (filterList && filterList.length) {
      activityResult = filterList[0];
    }

    // 先软删除活动名单
    await this.ctx.service.goodService.deleteRewardList(
      activityResult.activity_pm_code,
    );

    // // 过滤出中奖实物的
    // result.map(info => {
    //   if (info.reward_type === '0') {
    //     newResult.push(info);
    //   }
    // });

    // 查询参与活动的人员记录
    const drawList = await this.ctx.service.goodService.queryDrawList(
      activityResult.activity_pm_code,
    );

    await this.ctx.service.goodService.insertGoodsReward(result);

    await this.ctx.service.goodService.insertUser(result);

    return Promise.all(
      drawList.map(async info => {
        let insertRewardResult = null;
        const option = {
          goods_sku: info.goods_sku.replace(/\s*/g, ''),
          user_pm_code: info.user_pm_code.replace(/\s*/g, ''),
          activity_pm_code: info.activity_pm_code.replace(/\s*/g, ''),
          deleted: 0,
        };

        const isExit = await this.ctx.service.goodService.JudgeRewardExit(
          option,
        );

        if (!isExit) {
          const create_time = await this.ctx.service.data.getCurrentDate();
          const newInfo = {
            title: info.title,
            activity_pm_code: info.activity_pm_code,
            pm_code: info.pm_code,
            user_pm_code: info.user_pm_code,
            goods_sku: info.goods_sku,
            reward_type: '1',
            is_score: info.is_score,
            create_time,
            deleted: 0,
            award: '0',
          };
          insertRewardResult = await this.ctx.service.goodService.insertReward(
            newInfo,
          );
        }
        return insertRewardResult;
      }),
    )
      .then(async () => {
        await this.ctx.service.goodService.changeDrawState(
          activityResult.activity_pm_code,
          '200',
        );

        this.ctx.body = {
          success: true,
          message: '操作成功',
        };
      })
      .catch(error => {
        this.ctx.logger.error(new Error(error));
        this.ctx.body = {
          success: false,
          message: '操作失败',
        };
      });
  }

  // 中奖优惠券导出
  async discountExport() {
    const { activityPmCode } = this.ctx.request.query;

    // 查询中了优惠券的名单
    let activityList = await this.ctx.service.goodService.queryTypeRewardList(
      activityPmCode,
      typeEnum['discount'],
    );

    // 表头
    const header = {
      title: '活动名称',
      activity_pm_code: '活动PmCode',
      goods_sku: '商品sku',
      user_pm_code: '用户pmCode',
      user_name: '会员名称',
      mobile_phone: '会员手机号',
      level: '会员等级',
      reward_type: '中奖类型',
      is_score: '参与方式',
    };
    if (!activityList) {
      activityList = [];
    }

    // 生成数据
    const data = activityList.map(info => {
      let rewardText = null;
      let is_scoreText = null;
      if (info.is_score === '0') {
        is_scoreText = '分享';
      }
      if (info.is_score === '1') {
        is_scoreText = '积分';
      }
      if (info.reward_type === '0') {
        rewardText = '实物';
      }
      if (info.reward_type === '1') {
        rewardText = '优惠券';
      }
      return {
        activity_pm_code: info.activity_pm_code,
        goods_sku: info.goods_sku,
        user_name: info.user_name,
        mobile_phone: info.mobile_phone,
        title: info.title,
        reward_type: rewardText,
        is_score: is_scoreText,
        level: info.level,
        user_pm_code: info.user_pm_code,
      };
    });

    // 导出excel
    await this.exportXLSX(`优惠券中奖名单 `, `优惠券中奖名单 `, header, data);
  }

  // 中奖实物导出
  async goodsExport() {
    const { activityPmCode } = this.ctx.request.query;

    // 查询中了实物的名单
    let activityList = await this.ctx.service.goodService.queryTypeRewardList(
      activityPmCode,
      typeEnum['goods'],
    );

    // 表头
    const header = {
      title: '活动名称',
      activity_pm_code: '活动PmCode',
      goods_sku: '商品sku',
      productShortTitle: '商品名称',
      user_pm_code: '用户pmCode',
      user_name: '会员名称',
      mobile_phone: '会员手机号',
      level: '会员等级',
      is_score: '参与方式',
      goods_size: '商品尺码',
      address: '核销地址',
      award: '是否核销',
    };
    if (!activityList) {
      activityList = [];
    }

    // 生成数据
    const data = activityList.map(info => {
      let is_scoreText = null;
      let awardText = '未核销';
      if (info.is_score === '0') {
        is_scoreText = '分享';
      }
      if (info.is_score === '1') {
        is_scoreText = '积分';
      }
      if (info.award === '0') {
        awardText = '未核销';
      }
      if (info.award === '1') {
        awardText = '已核销';
      }
      return {
        activity_pm_code: info.activity_pm_code,
        goods_sku: info.goods_sku,
        user_name: info.user_name,
        mobile_phone: info.mobile_phone,
        address: info.address,
        title: info.title,
        award: awardText,
        is_score: is_scoreText,
        level: info.level,
        user_pm_code: info.user_pm_code,
        goods_size: info.goods_size,
        productShortTitle: info.productShortTitle,
      };
    });

    // 导出excel
    await this.exportXLSX(` 实物中奖名单 `, ` 实物中奖名单 `, header, data);
  }

  // 商品参与统计
  async goodsStatisticsExport() {
    const { activityPmCode = '', goodsSku = '' } = this.ctx.request.query;
    let goodsUserList;

    if (!activityPmCode) {
      this.ctx.body = {
        message: 'activityPmCode不能为空',
        success: false,
      };
      return;
    }

    if (goodsSku) {
      goodsUserList = await this.ctx.service.goodService.queryGoodsStatistics(
        activityPmCode,
        goodsSku,
      );
    }

    if (!goodsSku) {
      goodsUserList = await this.ctx.service.goodService.queryActivityStatistics(
        activityPmCode,
      );
    }

    // 表头
    const header = {
      title: '活动名称',
      activity_pm_code: '活动PmCode',
      goods_sku: '商品sku',
      productShortTitle: '商品名称',
      user_pm_code: '用户pmCode',
      user_name: '会员名称',
      mobile_phone: '会员手机号',
      level: '会员等级',
      is_score: '参与方式',
    };

    if (!goodsUserList) {
      goodsUserList = [];
    }

    // 生成数据
    const data = goodsUserList.map(info => {
      let is_scoreText = null;
      if (info.is_score === '0') {
        is_scoreText = '分享';
      }
      if (info.is_score === '1') {
        is_scoreText = '积分';
      }
      return {
        activity_pm_code: info.activity_pm_code,
        goods_sku: info.goods_sku,
        user_name: info.user_name,
        mobile_phone: info.mobile_phone,
        title: info.title,
        is_score: is_scoreText,
        level: info.level,
        user_pm_code: info.user_pm_code,
        productShortTitle: info.productShortTitle,
      };
    });

    // 导出excel
    await this.exportXLSX('活动参与名单', '活动参与名单', header, data);
  }

  // excel表格下载
  async exportXLSX(fileName, sheetName, header, data) {
    // 生成workbook
    const workbook = xlsx.utils.book_new();
    // 插入表头
    const headerData = [header];

    data.forEach(info => {
      headerData.push(info);
    });

    // 生成worksheet
    const worksheet = xlsx.utils.json_to_sheet(headerData, {
      skipHeader: true,
    });
    // 组装
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 返回数据流
    // @ts-ignore
    this.ctx.set('Content-Type', 'application/vnd.openxmlformats');
    // @ts-ignore
    this.ctx.set(
      'Content-Disposition',
      "attachment;filename*=UTF-8' '" + encodeURIComponent(fileName) + '.xlsx',
    );
    // @ts-ignore
    this.ctx.body = await xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });
  }
}

// eslint-disable-next-line no-undef
module.exports = FileController;
