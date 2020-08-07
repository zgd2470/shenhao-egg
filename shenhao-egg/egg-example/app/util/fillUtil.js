/* eslint-disable no-dupe-class-members */
/* eslint-disable no-undef */
'use strict';
const uuidUtil = require('./uuid');
const dataUtil = require('./data');

class FillUtil {
  //新增参数封装方法
  async fillNewRecord(body) {
    // eslint-disable-next-line no-undef
    const pm_code = uuidUtil.getUuid;
    const create_time = dataUtil.getCurrentDate;

    const newBody = Object.assign(
      { pm_code: pm_code, create_time: create_time },
      body,
    );
    return newBody;
  }

  //更新参数封装方法
  async fillModifyRecord(body) {
    // eslint-disable-next-line no-undef
    const modify_time = dataUtil.getCurrentDate;

    const newBody = Object.assign({ modify_time: modify_time }, body);
    return newBody;
  }
}

// eslint-disable-next-line no-undef
module.exports = FillUtil;
