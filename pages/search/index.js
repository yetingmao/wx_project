// pages/welcome/index.js
const App = getApp(),
    search = require("../../service/search"),
    Util = require('../../utils/util');
Page({
    data: {
        info: [],//店铺信息
        search: [],//搜索信息
        location: { }, //地理位置
        state: 1, //状态值   
        words: '', //搜索词
    },
    //清除前后空格的方法
    trim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },
    //清除tab标签
    clear: function (json) {
        json.forEach(function (item) {
            item.goods.forEach(function (value) {
                value.name = value.name.replace(/[(<tags>)||(</tags>)]/gi, '');
            })
        })
        return json;
    },
    //搜索历史去重
    unique: function (arr) {
        let n = {},
            r = []; //n为hash表，r为临时数组
        for (var i = 0; i < arr.length; i++) //遍历当前数组
        {
            if (!n[arr[i].name]) //如果hash表中没有当前项
            {
                n[arr[i].name] = true; //存入hash表
                r.push(arr[i]); //把当前数组的当前项push到临时数组里面
            }
        }
        return r;
    },
    //删除输入框的内容
    delSearch: function () {
        this.setData({
            state: 1,
            words: ''
        })
    },
    //ajax请求callback
    callBack: function (index, key) {     
        let that = this,
            locat=that.data.location;   
        if (index == 0) {
            search(0, key, locat, function (err, data) {
                if (err) {
                    wx.showModal({
                        title: '提示',
                        content: err || '搜索失败',
                        showCancel: false,
                        confirmText: '关闭'
                    });
                } else if (data.length > 0) {
                    that.setData({
                        state: 2,
                        search: data
                    });
                } else {
                    that.setData({
                        state: 4
                    });
                }
            })
        } else {
            search(1, key, locat, function (err, data) {
                if (err) {
                    wx.showModal({
                        title: '提示',
                        content: err || '搜索失败',
                        showCancel: false,
                        confirmText: '关闭'
                    });
                }
                else if (data.goods.length > 0) {
                    let json = that.clear(data.goods);
                    Util.storeTime(json, data.tp);
                    that.setData({
                        state: 3,
                        info: json
                    });
                }
                else {
                    that.setData({
                        state: 4
                    });
                }
            })
        }
    },
    //输入框搜索时
    searchGoods: function (e) {
        let that = this
            , w = that.trim(e.detail.value)
           ;
        if (w.length > 0) {
            that.setData({
                words: w
            });
            that.callBack(0, w);
        } else {
            that.setData({
                state: 1
            })
        }
    },
    //点击进入搜索结果的店铺
    searchResult: function (e) {
        let that = this
            , w = e.currentTarget.dataset.keyword
            , _arr = this.data.his
            , _w = this.data.words
            , _words = w || _w
            , his = {
                name: _words,
            }
            ;
        that.setData({
            words: _words,
        });
        _arr.unshift(his);
        wx.setStorageSync('_his', _arr);    
        that.callBack(1, _words);
    },
    //点击历史记录
    hisSearch: function (e) {
        let that = this
            , _data = e.currentTarget.dataset
            , w = _data.keyword 
            ;
        that.callBack(1, w);   
    },
    //点击进入店铺   
    toDetail: function (e) {
        wx.redirectTo({
            url: '../store/index?sid=' + e.currentTarget.dataset.id + '&lat=' + this.data.location.lat + '&lon=' + this.data.location.lon
        });
    },    
    //加载时
    onLoad: function (options) {    
        let ADDRESS = options,            
            lat = ADDRESS.lat
            , lon = ADDRESS.lon
            ;
        this.setData({
            location: {
                lat: lat,
                lon: lon
            },
        })
    },
    onShow: function () {
        let _his = wx.getStorageSync('_his');
        if (_his == '') {
            _his = [];   
        } else {
            _his = this.unique(_his)
        }
        this.setData({
            his: _his
        })
    }
});