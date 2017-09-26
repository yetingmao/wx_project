// pages/oDetail/index.js
const $ajax = require('../../utils/ajax').Ajax,
    Time = require('../../utils/time'),
    app = getApp();
Page({
    data: {
        id: 0,       //订单id
        obj: {},          //请求的数据
        stateTxt1: '',       //第一种状态文字
        stateTxt2: '',       //第二种状态文字
        stateTxt3: '',       //第三种状态文字
        active1: false,       //当前状态是否完成
        active2: false,
        active3: false,
        show: false              //打电话的模态框
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        if ('id' in options && options.id) {
            this.setData({
                id: options.id
            })
        }
    },
    //取消订单（所有的支付的未支付的）
    cancel: function (e) {
        let that = this;
        wx.showModal({
            title: '取消订单',
            content: '确认取消订单吗？',
            success: function (res) {
                let _oper = res.confirm;
                if (_oper == true) {
                    $ajax({
                        url: '/v1/order/op/cancel',
                        method: 'POST',
                        data: {
                            id: e.currentTarget.dataset.id
                        }
                    }, function (err, json) {
                        if (err) {
                            wx.showModal({
                                content: err || '当前网络不给力，请稍后重试~~',
                                showCancel: false,
                                confirmText: '关闭'
                            });
                        } else {
                            //已支付的话需要打电话
                            if (e.currentTarget.dataset.state == 20) {
                                that.setData({
                                    show: true,
                                });
                            }
                            that.onShow();
                        }
                    });
                } else {
                    return;
                }
            }
        });
    },
    //拨打电话
    callBusiness: function (e) {
        let _phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: _phone
        })
    },
    //点击取消call
    cancelCall: function (e) {
        this.setData({
            show: false,
        });
    },
    //点击跳转支付
    payoff: function (e) {
        let that = this,
            id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../pay/index?id=' + id
        })
    },
    //确认到达
    arriver: function (e) {
        let that = this,
            id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认订单',
            content: '确认订单已到达？',
            success: function (res) {
                let _oper = res.confirm;
                if (_oper == true) {
                    $ajax({
                        url: '/v1/order/op/confirm',
                        method: 'POST',
                        data: {
                            id: id
                        }
                    }, function (err, json) {
                        if (err) {
                            wx.showModal({
                                content: err || '当前网络不给力，请稍后重试~~',
                                showCancel: false,
                                confirmText: '关闭'
                            });
                        } else {
                            that.onShow();
                        }
                    });
                } else {
                    return;
                }
            }
        });
    },
    onShow: function () {
        // 页面显示
        const that = this;
        const para = {
            url: '/v1/order/query/detail',
            method: 'GET',
            data: {
                id: that.data.id
            }
        };
        $ajax(para, function (err, json) {
            if (err) {
                wx.showModal({
                    title: '提示',
                    content: err || '当前网络不给力，请稍后重试~~',
                    showCancel: false,
                    confirmText: '关闭'
                });
            } else {
                //当前状态停留阶段
                let text1 = '',
                    text2 = '',
                    text3 = '',
                    act1 = true,
                    act2 = false,
                    act3 = false;
                if ('state' in json && json.state) {
                    const state = json.state
                        ;
                    if (state == 5) { //待支付
                        text1 = '待支付';
                        text2 = '订单已提交';
                        text3 = '等待确认';
                    } else if (state == -100) {  //已取消，退款中；退款完成；
                        text1 = '订单已取消';
                        text2 = '退款中';
                        text3 = '退款已完成';
                        act2 = true;
                        act3 = (json.refundState == 10) ? true : false;
                    } else if (state == 20 || state == 99) {   //等待收货（已结单）; 订单已完成
                        text1 = '订单已提交';
                        text2 = '商家已接单';
                        text3 = '已送达';
                        act2 = true;
                        act3 = (state == 99 ? true : false);
                    } else if (state == -98) {   //订单未支付，已取消
                        text1 = '等待支付';
                        text2 = '订单已取消';
                        act2 = true;
                    } else if (state == 10) {   //等待确认
                        text1 = '订单已提交';
                        text2 = '等待确认';
                        text3 = '商家已接单';
                        act2 = true;
                    } else if (state == -99) {  //商家拒单，退款中
                        text1 = '商家拒单';
                        text2 = '退款处理中';
                        text3 = '退款已完成';
                        act2 = true;
                         act3 = (json.refundState == 10) ? true : false;
                    } else if (state == 30) {   //申请取消，等待确认
                        text1 = '商家已结单';
                        text2 = '用户取消';
                        text3 = '等待确认';
                        act2 = true;
                    } else if (state == -101 || (state == -101 && json.refundState == 10)) {  //-101：订单已拒收，退款中
                        text1 = '已同意退货';
                        text2 = '退款中';
                        text3 = '退款已完成';
                        act2 = true;
                        act3 = (state < 0 && json.refundState == 10) ? true : false;
                    }
                }
                that.setData({
                    obj: json,
                    stateTxt1: text1,
                    stateTxt2: text2,
                    stateTxt3: text3,
                    active1: act1,
                    active2: act2,
                    active3: act3
                });
                //修改倒计时
                let _json = that.data.obj;
                if (_json.state == 5 && _json.ttl > 0) {
                    Time(_json.ttl, function (str) {
                        that.setData({
                            prompt: str
                        })
                    })
                } else if (_json.state == 5 && _json.ttl == 0) {
                    that.setData({
                        prompt: '支付已超时'
                    })
                }
            }
        });

    },
    onHide: function () {
        // 页面隐藏
    }
})