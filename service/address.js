/**
 * Created by ytm on 2017/2/27.
 */
const _ajax = require('../utils/ajax').Ajax;
const address = function (i, data, cb) {
    let _json = {};
    if (i == 0) {
        _json = {
            method: 'get',
            data: data,
            url: "/v1/address"
        }
    } else if (i == 1) {
        _json = {
            method: 'post',
            data: data,
            url: "/v1/address"
        }
    }
    _ajax(_json, cb);
};
module.exports = address;