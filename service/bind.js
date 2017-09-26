/**
 * Created by ytm on 2017/3/6.
 */
//检查是否为已绑定用户
const _ajax = require('../utils/ajax').Ajax;
module.exports = function (cb) {
    let _json = {
        method: 'post',
    }
    _json.url = "/v1/user/binding"
    _ajax(_json, cb);
};