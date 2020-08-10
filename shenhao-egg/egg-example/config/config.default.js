/* eslint-disable no-undef */
/* eslint valid-jsdoc: "off" */

'use strict'
module.exports = (appInfo) => {
  const config = {}
  config.keys = appInfo.name + '_1569034553506_3511'
  config.mysql = {
    client: {
      // host
      host: '127.0.0.1',
      // port
      port: '3306',
      // username
      user: 'root',
      // password
      password: '123456',
      // database
      database: 'shenhao',
    },
    // load into app, default is open
    app: true,
    // load into agent, default is close
    agent: false,
  }
  config.security = {
    csrf: {
      enable: false,
    },
  }

  config.cluster = {
    listen: {
      path: '',
      port: 8080, // 修改端口
    },
  }

  // config/config.default.js
  config.multipart = {
    mode: 'file',
    fileSize: '500mb', // 文件大小
    whitelist: ['.xlsx', '.xls', '.png', '.jpg', '.jpeg', '.mp4'],
  }

  return {
    ...config,
  }
}
