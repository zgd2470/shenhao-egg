/* eslint-disable no-undef */
const Subscription = require('egg').Subscription;

class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      // interval: '1m', // 1 分钟间隔
      cron: '*/30 * * * * *', // 也可以通过 cron 表达式来构建时间间隔
      type: 'worker', //
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    this.setIntervalChangeActivityState();
  }

  // 改变活动状态
  async setIntervalChangeActivityState() {
    const activityMap = await this.ctx.service.goodService.queryAllActivity();
    activityMap.map(async info => {
      const startTime = Date.parse(new Date(info.start_time)) / 1000;
      const endTime = Date.parse(new Date(info.end_time)) / 1000;
      const nowTime = Number(Date.parse(new Date()) / 1000);
      const activityOfflineTime =
        Date.parse(new Date(info.offline_time)) / 1000;
      const activity_pm_code = info.activity_pm_code;
      const activity_state = info.activity_state;
      const draw_state = info.draw_state;
      let now_state = null;

      // 100未启用  200 启用  300开始  400结束 500整体结束
      // 状态是100,400 ,500时候不关心
      if (activity_state === '100' || activity_state === '500') {
        return;
      }

      if (activity_state === '200') {
        // 如果状态是启用的 而且时间在开始于结束时间之间置为开始活动
        if (startTime <= nowTime && nowTime <= endTime) {
          now_state = '300';
        }
        if (nowTime > endTime) {
          now_state = '400';
        }
      }

      if (activity_state === '300') {
        // 如果状态是开始的 而且时间结束时间之后置为借宿活动状态

        if (nowTime >= endTime) {
          now_state = '400';
          // 活动结束时，如果抽过奖需要把后来的人以中优惠券的方式加入中奖表
          if (draw_state === '200') {
            // 查询该活动的所有参与记录
            const drawList = await this.ctx.service.goodService.queryDrawList(
              info.activity_pm_code,
            );

            // 将后来参与的人以优惠券中奖形式加入中奖表
            await this.ctx.service.goodService.judgeExitAndInsert(
              drawList || [],
            );
          }
        }
      }

      if (activity_state === '400') {
        if (nowTime >= activityOfflineTime) {
          now_state = '500';
        }
      }

      // 如果现在的状态跟上一个状态不一致，就更新数据库存的状态
      if (activity_state !== now_state && now_state !== null) {
        await this.ctx.service.goodService.changeState(
          activity_pm_code,
          now_state,
        );
        if (now_state === '400') {
          await this.sendDiscount(activity_pm_code);
        }
      }
    });
  }

  async sendDiscount(activityPmCode) {
    const activityEdit = await this.ctx.service.goodService.queryActivity(
      activityPmCode,
    );

    if (!activityEdit) {
      return;
    }

    if (
      activityEdit.can_published === '1' &&
      activityEdit.activity_state === '400'
    ) {
      // 发送优惠券
      const sendList = await this.ctx.service.goodService.sendDiscount(
        activityPmCode,
      );

      return Promise.all(
        sendList.map(async info => {
          const sendResult = await this.ctx.service.goodService.sendDiscountApi(
            info.couponTemplateNo,
            info.memberNoList,
          );
          return sendResult;
        }),
      )
        .then(async result => {
          // 发送消息
          const rewardList = await this.ctx.service.goodService.queryAllRewardList(
            activityPmCode,
          );

          // 发送消息
          await this.ctx.service.goodService.sendMessage(rewardList || []);

          this.ctx.body = {
            message: '操作成功',
            success: true,
            result,
          };
        })
        .catch(error => {
          this.ctx.logger.error(new Error(error));
        });
    }
  }
}
// eslint-disable-next-line no-undef
module.exports = UpdateCache;
