/**
 * Created by ytm on 2017/2/17.
 */
const QQMapWX = require('qqmap-wx-jssdk.js');
module.exports = (text, callback) => {
    let _l = {},
        _ = {}
        , map = new QQMapWX({
            key: 'UKUBZ-WNLK5-XDUIM-QDTZG-AH2DT-GOFQS'
        });;
    if (text) {
        map.getSuggestion({
            keyword: text,
            success: function (res) {
                if (res) {
                    if (res.status == 0) {
                        _.data = res.data;
                    } else {
                        _.error = res.message;
                    }
                } else {
                    _.error = '搜索失败'
                }
            },
            fail: function (error) {
                _.error = '当前网络不给力，请稍后重试~~';
            },
            complete: function (res) {
                callback(_.error, _.data);
            }
        });
    } else {
        wx.hideToast();
        wx.getLocation({
            type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
            complete: function (res) {
                wx.showToast({
                    'title': '正在加载',
                    'icon': 'loading',
                    'duration': 10000,
                    'mask': true
                });
                if (res.latitude && res.longitude) {
                    _l = {
                        latitude: res && res.latitude || '',
                        longitude: res && res.longitude || ''
                    };
                }
                if (_l && Object.keys(_l).length > 0) {
                    map.reverseGeocoder({
                        location: _l,
                        get_poi: 1,
                        success: (res) => {
                            if (res) {
                                if (res.status == 0) {
                                    _.data = res.result;
                                } else {
                                    _.error = res.message;
                                }
                            } else {
                                _.error = '当前网络不给力，请稍后重试~~'
                            }
                        },
                        fail: (error) => {
                            _.error = '当前网络不给力，请稍后重试~~';
                        },
                        complete: (res) => {
                            wx.hideToast();
                            callback(_.error, _.data);
                        }
                    });
                } else {
                    map.reverseGeocoder({
                        get_poi: 1,
                        success: (res) => {
                            if (res) {
                                if (res.status == 0) {
                                    _.data = res.result;
                                } else {
                                    _.error = res.message;
                                }
                            } else {
                                _.error = '当前网络不给力，请稍后重试~~'
                            }
                        },
                        fail: (error) => {
                            _.error = '当前网络不给力，请稍后重试~~';
                        },
                        complete: (res) => {
                            wx.hideToast();
                            callback(_.error, _.data);
                        }
                    });
                }

            }
        });

    }
};