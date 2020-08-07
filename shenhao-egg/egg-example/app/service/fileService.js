/* eslint-disable no-undef */
'use strict';
// eslint-disable-next-line no-undef
const Service = require('egg').Service;
const fs = require('fs');
const path = require('path');
const sendToWormhole = require('stream-wormhole');

const fillUtil = require('../util/fillUtil.js');

class FileService extends Service {
  async index() {
    const ctx = this.ctx;
    const stream = await ctx.getFileStream();
    const fileName = stream.filename;

    const target = path.join(
      this.config.baseDir,
      `app/public/comfiles/${stream.filename}`,
    );
    const result = await new Promise((resolve, reject) => {
      const remoteFileStream = fs.createWriteStream(target);
      stream.pipe(remoteFileStream);
      let errFlag;
      remoteFileStream.on('error', err => {
        errFlag = true;
        sendToWormhole(stream);
        remoteFileStream.destroy();
        reject(err);
      });

      remoteFileStream.on('finish', async () => {
        if (errFlag) return;
        resolve({ fileName, name: stream.fields.name });
      });
    });
    return result;
  }

  async save(url, fileName) {
    const data = {
      file_path: url,
      file_name: fileName,
      deleted: 0,
    };

    // eslint-disable-next-line no-const-assign
    const result = await this.ctx.service.fillUtil.fillNewRecord(data);

    await this.app.mysql.insert('file', result);

    return result.pm_code;
  }
  async getFilePath(pm_code) {
    const option = {
      where: {
        pm_code,
      },
      columns: ['file_path', 'file_name'],
    };

    const result = await this.app.mysql.select('file', option);
    return JSON.parse(JSON.stringify(result))[0];
  }
}

// eslint-disable-next-line no-undef
module.exports = FileService;
