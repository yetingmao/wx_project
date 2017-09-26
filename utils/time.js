/**
 * Created by ytm on 2017/3/7.
 */
const Time = function (time, cb, tag) {
    let str = '';
    const timer = function () {
        let leftsecond = time,
            hour = Math.floor(leftsecond / 3600),
            minute = Math.floor((leftsecond - hour * 3600) / 60),
            second = Math.floor(leftsecond - hour * 3600 - minute * 60);
        if (tag) {
            str = (hour == 0 ? '00' : hour) + ':' + (minute < 10 ? '0' + minute : minute) + ":" + (second < 10 ? '0' + second : second);
        } else {
            str = "(还剩：" + (hour && hour > 0 ? hour + "小时" : '') + minute + "分" + second + "秒)";
        }
        --time;
        if (time < 0) {
            clearInterval(Timer);
            str = tag ? "" : '(支付超时)';
        }
        cb(str, timer);
    }
    const Timer = setInterval(function () { timer() }, 1000);
};
module.exports = Time;
