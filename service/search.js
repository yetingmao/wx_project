/**
 * Created by ytm on 2017/2/24.
 */
const _ajax = require('../utils/ajax').Ajax;
const search = function (i, w, data, cb) {
    //todo   范围
    let _data = data;
    let _json = {
        method: 'get',
        data: _data,
        tag: 1
    }
    if (i == 0) {
        _json.url = "/v1/search/g/" + encodeURIComponent(w)
    } else {
        _json.url = "/v1/search/s/" + encodeURIComponent(w)
    }
    _ajax(_json, cb);
};
module.exports = search;