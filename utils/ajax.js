/**
 * Created by yns on 2017/2/17.
 */
"use strict";

const App = getApp(),
    Util = require('/util.js'),
    TOKEN = require('../service/token').token;
// 构造标准ajax请求 json为请求的参数（url,method,data）
// todo token  请求失败，重新请求token，该方法重新执行
module.exports = {
    Ajax: (json, callback) => {
        json.tag ? '' : Util.toast();
        //json中data传递属性名为1，则直接拼1的属性值
        let _ = {},
            str = '',
            _data = json.data,
            _str = '',
            Token = App.TOKEN;
        if (json.method == 'get') {
            if (_data && _data instanceof Object && Object.keys(_data).length > 0) {
                Util.eachArr(_data, function (i, o) {
                    if (i == 1) {
                        _str = o;
                    } else {
                        str += i + '=' + o + '&'
                    }
                });
            }
        }
        json.url = App.BASE_URL + json.url + _str + (str ? ('?' + str) : '');
        wx.request({
            url: json.url
            , data: json.data
            , method: json.method
            , header: {
                'content-type': 'application/json',
                'authorization': Token
            },
            complete: (res) => {
                wx.hideToast();
                if (res && res.data && res.data.status && res.data.status > 0) {
                    if (res.data.data) {
                        _.data = res.data.data;
                    } else {
                        _.data = res.data;
                    }
                    callback(null, _.data)
                } else {
                    callback(res && res.data && res.data.message || '当前网络不给力，请稍后重试~~', null)
                }
            }
        });

    }

};