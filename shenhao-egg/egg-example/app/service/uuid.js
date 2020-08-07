'use strict';
// eslint-disable-next-line no-undef
const Service = require('egg').Service;

class UuidUtil extends Service {
  //获取uuid
  async getUuid() {
    // eslint-disable-next-line no-undef
    const uuid = require('node-uuid');
    return uuid.v4().replace(/-/g, '');
  }
}

// eslint-disable-next-line no-undef
module.exports = UuidUtil;
