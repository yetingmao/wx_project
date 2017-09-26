var app = getApp(),
    Ajax = require('../../utils/ajax').Ajax,
    Util = require('../../utils/util'),
    Time = require('../../utils/time');
Page({
    data: {
        detail: false,
        Detail: {},
        goods: [],
        src: '../../images/arr.png'
    },
    onLoad: function (options) {
        Util.toast();
        const that = this;
        that.setData({
            id: options.id
        })
    },
    /*事件监听*/
    //订单详情展示
    detailsShow: function (e) {
        let tag = e.currentTarget.dataset.tag,
            boo = false,
            src = '';
        if (tag == 0) {
            boo = false;
            src = '../../images/arr.png';
        } else {
            boo = true;
            src = '../../images/arr-up.png';
        }
        this.setData({
            detail: boo,
            src: src
        });
    },
    getDetail: function (id, cb) {
        Ajax({
            url: '/v1/order/query/detail',
            data: {
                id: id
            }, method: 'get'
        }, function (err, json) {
            if (err) {
                Util.setAlert({ content: err || '当前网络不给力，请稍后重试~~' })
            } else {
                wx.hideToast();
                cb(json);
            }
        })
    },

    pay: function () {
        const that = this,
            _data = that.data;
        Util.toast();
        //请求后台支付
        Ajax({ url: '/v1/pay/order', method: 'post', data: { id: that.data.Detail.id } },
            (err, json) => {
                if (err) {
                    Util.setAlert({ content: err || '当前网络不给力，请稍后重试~~' });
                } else {
                    wx.hideToast();
                    //调用微信支付接口
                    wx.requestPayment({
                        'timeStamp': String(json.timeStamp),
                        'nonceStr': json.nonceStr,
                        'package': json.package,
                        'signType': json.signType,
                        'paySign': json.signStr,
                        'complete': function (res) {
                            if (res.errMsg.split('cancel').length > 1) {//失败
                                Util.setAlert({ content: '支付失败' });
                            } else if (res.errMsg.split('ok').length > 1) {//成功
                                Util.toast();
                                that.setData({
                                    payTag: 1
                                })
                                that.getDetail(_data.Detail.id, function (json) {
                                    wx.hideToast();
                                    if (json.state <= 5) {
                                        setTimeout(function () {
                                            that.getDetail(_data.Detail.id, function (_js) {
                                                if (_js.state > 5) {
                                                    that.setData({
                                                        timeTag: 1,
                                                        payTag: 1
                                                    })
                                                } else if (_js.state == 5) {//
                                                    that.setData({
                                                        prompt: '等待支付',
                                                        timeTag: '',
                                                        payTag: ''
                                                    })
                                                } else {
                                                    that.setData({
                                                        prompt: '',
                                                        payTag: ''
                                                    })
                                                }

                                            })
                                        }, 3000)
                                    }
                                })
                            }
                        }

                    })
                }
            })

    },
    onShow: function () {
        const that = this;
        Util.toast();
        // 页面初始化 options为页面跳转所带来的参数
        that.setData({
            Timer: ''
        })
        that.getDetail(that.data.id, function (json) {
            that.setData({
                Detail: json,
                goods: json.details
            })
            wx.hideToast();
            if (json.state == 5) {
                if (json.ttl > 0) {
                    Time(json.ttl, function (str, Timer) {
                        that.setData({
                            prompt: str,
                            Timer: Timer
                        })
                    }, 1)
                }
            } else {
                that.setData({
                    prompt: json.stateInfo
                })
            }

        })
    }
});