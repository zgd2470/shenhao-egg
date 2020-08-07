'use strict';

class DataUtil {
    //获取当前时间
    async getCurrentDate() {
        var date=new Date();
        var year=date.getFullYear();
        var month=date.getMonth()+1;
        var day=date.getDate();
        var hours=date.getHours();
        var minutes=date.getMinutes();
        var seconds=date.getSeconds();
        // eslint-disable-next-line no-undef
        return year+"-"+formatZero(month)+"-"+formatZero(day)+" "+formatZero(hours)+":"+formatZero(minutes)+":"+formatZero(seconds);
    }
}

// eslint-disable-next-line no-undef
module.exports = DataUtil;
