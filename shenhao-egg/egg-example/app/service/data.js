'use strict';
const Service = require('egg').Service;
const moment = require('moment');

class DataUtil extends Service {
  //获取当前时间
  async getCurrentDate() {
    var date = new Date();
    const resultTime = moment(date).format('YYYY-MM-DD HH:mm:ss');
    return resultTime;
  }
}

// eslint-disable-next-line no-undef
module.exports = DataUtil;
