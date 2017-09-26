//index.js
//获取应用实例
const Util = require('../../utils/util'),
    $ajax = require('../../utils/ajax').Ajax,
    app = getApp();
Page({
    data: {
        listData: [],       // 店铺列表数据
        page: 0,            // 数据的页数
        count: 0,           // 列表总条数
        bottom: '加载中...', // 底部提示文字
        lon: 0,             // 定位经度
        lat: 0,             // 定位纬度
        address: ''         // 定位地址
    },
    store: function (page, data) {
        let that=this;
        // 获取店铺列表
        let bottom = this.data.bottom,
            setList = {
                url: '/v1/store',
                method: 'GET',

                data: {
                    lat: data.lat,
                    lon: data.lon,
                    offset: page * app.LIMIT,
                    limit: app.LIMIT,
                    radius: 3000
                },
            };
        $ajax(setList, (err, json) => {
            if (err) {
                Util.setAlert({ content: err || '获取附近商家列表失败' });
            } else {
                if (json.count <= page * app.LIMIT + app.LIMIT) {
                    bottom = '暂无更多附近商家';
                }
                let pageList = this.data.listData,
                    allList = page == 0 ? json.stores : pageList.concat(json.stores);
                Util.storeTime(allList, json.timestamp);
                
                that.setData({
                    listData: allList,
                    count: json.count,
                    bottom: bottom
                });
            }
        });
    },
    /*事件处理函数*/
    // 下拉刷新回调接口
    upper: function () {
        wx.showToast({
            'title': '正在加载',
            'icon': 'loading',
            'duration': 1000,
            'mask': true
        });
        //请求列表数据，offset=0
        this.store(0, app.ADDRESS);
    },
    // 上拉加载回调接口
    lower: function () {
        //todo 请求从limit+offset条开始，limit条数据 （常量limit存在app.js里）
        var that = this;
        let apage = this.data.page
            , acount = this.data.count;
        if (acount >= apage * app.LIMIT + app.LIMIT) {
            apage++;
            that.setData({
                page: apage
            });
            this.store(this.data.page);
        } else {
            this.setData({
                bottom: '暂无更多附近商家'
            });
        }
    },
    // 跳转到定位页面
    toLocation: function () {
        wx.navigateTo({
            url: '../location/index?address=' + this.data.address
        });
    },
    getInit: function (Time) {
        const ADDRESS = app.ADDRESS,
            _lat = ADDRESS.lat,
            _lon = ADDRESS.lon;
        this.setData({
            lon: _lon,
            lat: _lat,
            address: ADDRESS.address
        });
        if (app.TOKEN && ADDRESS) {
            clearInterval(Time);

            this.store(0, {
                lon: _lon,
                lat: _lat
            });
        }
    },
    changeDate: function () {
        let tag = 0,
            that = this;
        if (tag > 6) {
            Util.setAlert({ content: '获取用户信息失败，请重新进入小程序' });
        } else {//请求定位跟token多次
            const Time = setInterval(function () {
                tag++;
                that.getInit(Time);
            }, 1500)
        }
    },
    onLoad: function () {       
        let that = this;
        that.changeDate();
    },
    toSearch: function () {
        wx.navigateTo({
            url: '../search/index?lat=' + this.data.lat + '&lon=' + this.data.lon
        });
    },
    toDetail: function (e) {
        wx.navigateTo({
            url: '../store/index?sid=' + e.currentTarget.dataset.id + '&lat=' + this.data.lat + '&lon=' + this.data.lon + '&radius=' + e.currentTarget.dataset.radius
        });
    }
});
