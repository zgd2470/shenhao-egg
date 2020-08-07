// eslint-disable-next-line no-undef
const Service = require('egg').Service;

class CustimService extends Service {
  // eslint-disable-next-line no-unused-vars
  async getInfo(options) {
    // 查询
    // const result = await this.app.mysql.select('user', {
    //   where: { id: 1 },
    // });

    const result = { id: 0 };

    // 插入
    // let resultAdd = await this.app.mysql.insert("user",{username:"lisi",password:'1234'})


    // let resultUp = await this.app.mysql.update('user',{ id:2, username:'赵四' });
    // 修改数据的第二种方式：通过 sql 来修改数据
    // let resultsByUp=await this.app.mysql.query('update user set username = ? where id = ?',['王五',2]);

    // 配置上传
    // eslint-disable-next-line no-undef
    config.multipart = {
      fileSize: '50mb',
      mode: 'stream',
      fileExtensions: [ '.xls', '.txt' ], // 扩展几种上传的文件格式
    };

    return result;
  }
}

// eslint-disable-next-line no-undef
module.exports = CustimService;
