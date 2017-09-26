// pages/order/index.js
const app = getApp(),
    Util = require('../../utils/util'),
    $ajax = require('../../utils/ajax').Ajax,
    Bind = require("../../service/bind");
Page({
    data: {
        offset: 0,
        count: 0,        //总数据数量
        bottom: '',
        show: false,    //模态框显示状态
        phone: '',    //商家电话
        state: '',   //页面状态
    },
    list: function (offset) {
        const that = this
            , json = {
                'url': '/v1/order/query/list',
                'method': 'GET',
                'data': {
                    'limit': app.LIMIT,
                    'offset': offset
                }
            };
        //请求list接口
        $ajax(json, function (err, json) {
            wx.stopPullDownRefresh();
            if (err) {
                wx.showModal({
                    title: '提示',
                    content: err || '当前网络不给力，请稍后重试~~',
                    showCancel: false,
                    confirmText: '关闭'
                });
            } else {
                let allList = [];
                if ('data' in json && json.data.length > 0) {
                    let aList = that.data.aList || [];
                    allList = aList.concat(json.data);
                    that.data.offset = allList.length;
                    //转换一下时间
                    Util.eachArr(allList, function (i, o) {
                        if (o.state == 5 && o.ttl > 0) {
                            allList[i].prompt = '去支付';
                        } else if (o.state == 5 && o.ttl == 0) {
                            allList[i].prompt = '支付已超时'
                        }
                    });
                    //如果第一次加载完的话显示暂无数据
                    if (json.count <= that.data.offset.length) {
                        that.setData({
                            bottom: '暂无更多订单'
                        });
                    }
                }
                that.setData({
                    aList: allList,
                    count: json.count
                });
            }
        });
    },
    //上拉加载
    lower: function () {
        // 当count>=limit+offset,请求list接口（page++）
        let that = this,
            _offset = this.data.offset,
            allCount = this.data.count;
        if (allCount > _offset) {
            that.setData({
                offset: _offset,
                bottom: '加载中...'
            });
            this.list(this.data.offset);
        } else {
            that.setData({
                bottom: '暂无更多订单'
            });
        }
    },
    //下拉刷新
    upper: function () {
    },
    //点击取消订单(未支付，已支付)
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
                            //todo  已支付的话需打电话
                            if (e.currentTarget.dataset.state == 20) {
                                that.setData({
                                    show: true,
                                    phone: e.currentTarget.dataset.phone
                                });
                            }
                            that.onHide();
                            that.list(that.data.offset);
                        }
                    });
                } else {
                    return;
                }
            }
        });
    },
    //点击取消call
    cancelCall: function (e) {
        this.setData({
            show: false,
        });
    },
    //拨打电话
    callBusiness: function () {
        //todo 模拟器有用，手机没效果
        wx.makePhoneCall({
            phoneNumber: this.data.phone
        })
    },
    //绑定用户
    bind: function () {
        wx.navigateTo({
            url: '../bind/index?page=order'
        })
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
                                content: err || '确认订单到达失败',
                                showCancel: false,
                                confirmText: '关闭'
                            });
                        } else {
                            that.onHide();
                            that.list(that.data.offset);
                        }
                    });
                } else {
                    return;
                }
            }
        });
    },
    //去逛逛
    look: function (e) {
        wx.switchTab({
            url: '../index/index'
        })
    },
    logon: function () {
        //判断用户是否绑定
        let that = this;
        Bind(function (err, data) {
            if (err) {
                wx.showModal({
                    title: '提示',
                    content: err || '用户还未绑定',
                    showCancel: false,
                    confirmText: '关闭'
                });
            } else if (data && 'phone' in data && data.phone) {
                that.setData({
                    state: 1
                });
                that.list(that.data.offset);
            } else {
                that.setData({
                    state: 2
                });
            }
        });
    },
    onShow: function (e) {
        let that = this;
        if (app.TOKEN) {
            that.logon();
        } else {
            app.Token(function (_err, json) {
                if (_err) {
                    Util.setAlert({ content: _err || '请求用户信息失败' });
                } else {
                    that.logon();
                }
            }, { tag: 0 })
        };
    },
    onHide: function () {
        this.data.offset = 0;
        this.data.aList = [];
    },
    onLoad: function () {
        let that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    scrollHeight: res.windowHeight
                });
            }
        });
    },
    //下拉刷新
    onPullDownRefresh: function () {
        this.onLoad();
        wx.showToast({
            'title': '正在加载',
            'icon': 'loading',
            'duration': 2000,
            'mask': true
        });
        this.setData({
            scrollTop: 0
        })
        this.onHide();
        this.list(0);
    },
})