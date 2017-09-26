//app.js
const location = require('utils/location');
App({
    BASE_URL: 'XXXXXX', //路由地址
    LIMIT: 15,
    TOKEN: '',
    ADDRESS: '',
    CODE: '',
    onLaunch: function() {
        //调用API从本地缓存中获取数据
        var logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        wx.setStorageSync('logs', logs);
    },
    Login: (callback) => {
        let _err, code;
        wx.login({
            complete: (res) => {
                if (res.code) {
                    code = res.code;
                } else {
                    _err = res.errMsg || '获取微信信息失败，请重新登陆小程序';
                }
                if (callback && typeof callback == 'function') {
                    callback(_err, code)
                }
            }
        });
    },
    setToken: function(URL, json, callback) {
        let that = this,
            _err,
            _data;
        json.tag++;
        wx.request({
            url: URL + '/v1/auth/wx',
            method: 'POST',
            data: {
                code: json && json.code || ''
            },
            header: {
                'content-type': 'application/json'
            },
            complete: function(res) {
                wx.hideToast();
                if (res && res.data && res.data.status > 0) {
                    const _token = res.data.data;
                    that.TOKEN = _token;
                    _data = _token;
                } else { //status==-1为token失效
                    if (json.tag <= 4) {
                        wx.login({
                            complete: (res) => {
                                if (res.code) { //重新获取code
                                    json.code = res.code;
                                    that.setToken(URL, json, callback);
                                }
                            }
                        });

                    } else {
                        _err = (res.data.message instanceof Object ? res.data.message.message : res.data.message) ||
                            '当前网络不给力，请稍后重试~~'
                        wx.showModal({
                            title: '提示',
                            content: _err || '当前网络不给力，请稍后重试~~',
                            showCancel: false,
                            confirmText: '关闭'
                        });

                    }
                }
                if (callback && typeof callback == 'function') {
                    callback(_err, _data)
                }
            }
        });
    },
    Token: function(cb, json) {
        wx.showToast({
            'title': '正在加载',
            'icon': 'loading',
            'duration': 10000,
            'mask': true
        });
        let that = this;
        if (!json.code) {
            that.firstL(json.tag, cb);
        } else {
            that.setToken(that.BASE_URL, json, cb);
        }
    },
    getLocation: function() {
        location('', (err, json) => {
            wx.hideToast();
            if (err) {
                wx.showModal({
                    title: '提示',
                    content: err || '当前网络不给力，请稍后重试~~',
                    showCancel: false,
                    confirmText: '关闭'
                });
            } else { //把定位设在缓存里
                this.ADDRESS = {
                    address: json.address,
                    lon: json.location.lng,
                    lat: json.location.lat
                }
            }
        });
    },
    getUserInfo: function(cb) {
        var that = this;
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo, null);
        } else {
            //调用登录接口
            that.Login(function(_err, json) {
                if (_err) {
                    cb(null, _err)
                } else {
                    wx.getUserInfo({
                        success: function(res) {
                            that.globalData.userInfo = res.userInfo;
                            typeof cb == "function" && cb(that.globalData.userInfo, null);
                        }
                    });
                }
            })
        }
    },
    firstL: function(_tag, cb) {
        let that = this;
        _tag++;
        that.Login(function(_err, json) {
            wx.hideToast();
            if (_err) {
                if (_tag <= 4) {
                    that.firstL();
                } else {
                    wx.showModal({
                        title: '提示',
                        content: err || '店铺需要您授权，请您同意授权',
                        showCancel: false,
                        confirmText: '关闭'
                    });
                }
            } else {
                that.Token(cb, { tag: _tag, code: json });
                that.getLocation();
            }

        });
    },
    onLaunch: function() {
        let that = this,
            _tag = 0;
        that.firstL(_tag);
    },

    globalData: {
        userInfo: null,
    }
});