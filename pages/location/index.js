// pages/relocation/index.js
const location = require("../../utils/location")
    , address = require("../../service/address")
    , Bind = require("../../service/bind")
    , App = getApp();
;
Page({
    data: {
        info: [],//收货地址
        pois: [],//搜索结果
        currentAddress: '',//当前地址
        state: 1,//状态值
        words: '',//搜索词
        temp: false//判断是否有收货地址
    },
    //清除前后空格的方法
    trim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },
    //搜索历史去重
    unique: function (arr) {
        let n = {},
            r = []; //n为hash表，r为临时数组
        for (var i = 0; i < arr.length; i++) //遍历当前数组
        {
            if (!n[arr[i].address]) //如果hash表中没有当前项
            {
                n[arr[i].address] = true; //存入hash表
                r.push(arr[i]); //把当前数组的当前项push到临时数组里面
            }
        }
        return r;
    },
    //点击重新加载进入首页
    reLocation: function (e) {
        let that = this
            , _data = e.currentTarget.dataset
            , _arr = this.data.his
            , pages = getCurrentPages()
            ;
        _arr.unshift(_data);
        //把当前的存放到历史记录里
        wx.setStorageSync('his', _arr);
        //修改首页的定位
        that.setIndexL(_data);
        wx.switchTab({
            url: '../index/index'
        });
    },
    //点击收货地址进入首页
    reAddress: function (e) {
        let that = this
            , _data = e.currentTarget.dataset
            , pages = getCurrentPages()
            ;
        //获得首页的page
        that.setIndexL(_data);
        wx.switchTab({
            url: '../index/index'
        });
    },
    //搜索地址
    addressResult: function () {
        let that = this,
            _w = that.data.words;
            location(_w, function (err, data) {
                if (err) {
                    wx.showModal({
                        title: '提示',
                        content: err || '当前网络不给力，请稍后重试~~',
                        showCancel: false,
                        confirmText: '关闭'
                    });
                } else {
                    if (data && data.length > 0) {
                        that.setData({
                            state: 3,
                            pois: data
                        })
                    } else {
                        that.setData({
                            state: 4,
                        })
                    }
                }
            })
    },
    //输入地址时
    searchAddress: function (e) {
        let that = this
            , w = this.trim(e.detail.value);
        if (w.length > 0) {
            that.setData({
                words: w,
            });
            setTimeout(function () {
                 that.addressResult();
            }, 500);
               
        } else {
            that.setData({
                state: 1
            })
        }
    },
    //输入框获取焦点时
    onFocus: function (e) {
        let w = this.trim(e.detail.value)
            , that = this
            ;
        if (w) {
            that.setData({
                state: 3,
            })
        } else {
            that.setData({
                state: 2,
            })
        }
    },
    //点击删除时
    delSearch: function () {
        this.setData({
            state: 1,
            words: ''
        })
    },        
    setIndexL: function (data) {   
        App.ADDRESS = {
            lat: data.location.lat,
            lon: data.location.lon || data.location.lng,
            address: data.address
        }
        const pages = getCurrentPages(),
            prePage = pages[pages.length - 2];
        prePage.changeDate();
    },
    //重新获取当前位置信息
    getlocation: function () {
        let that = this,
            pages = getCurrentPages();
        location('', function (err, data) {
            if (err) {
                wx.showModal({
                    title: '提示',
                    content: err || '当前网络不给力，请稍后重试~~',
                    showCancel: false,
                    confirmText: '关闭'
                });
            } else {
                that.setData({
                    currentAddress: data.address
                });
                data.location.lon = data.location.lng;
                //获得首页的page
                that.setIndexL(data);
            }
        })
    },
    onShow: function () {
        let that = this,
            _his = wx.getStorageSync('his');
        if (_his == '') {
            _his = [];
        } else {
            _his = this.unique(_his)
        }
        that.setData({
            his: _his,
        });
    },
    onLoad: function (options) {          
        let that = this;
        // 页面初始化 options为页面跳转所带来的参数
        if ('address' in options && options.address) {
            that.setData({
                currentAddress: options.address,
            });
        } else {
            that.setData({
                currentAddress: '暂无定位地址',
            });
        }
        //附近地址
        location('', function (err, data) {
            if (err) {
                wx.showModal({
                    title: '提示',
                    content: err || '当前网络不给力，请稍后重试~~',
                    showCancel: false,
                    confirmText: '关闭'
                });
            } else {
                that.setData({
                    pois: data.pois
                })
            }
        });
        //判断是否登录，是否有收货地址
        Bind(function (err, data) {
            if (err) {
                wx.showModal({
                    title: '提示',
                    content: err || '用户还未绑定',
                    showCancel: false,
                    confirmText: '关闭'
                });
            } else if (data && 'phone' in data && data.phone) {
                //用户如果绑定的话，再获取用户的收货地址
                address(0, { type: 1 }, function (err, data) {
                    if (err) {
                        wx.showModal({
                            title: '提示',
                            content: err || '当前网络不给力，请稍后重试~~',
                            showCancel: false,
                            confirmText: '关闭'
                        });
                    } else if ('address' in data && data.address.length > 0) {
                        that.setData({
                            temp: true,
                            info: data.address
                        })
                    } else {
                        that.setData({
                            temp: false
                        })

                    }
                });
            } else {
                that.setData({
                    temp: false
                });
            }
        })
    }
})