// pages/goods/index.js
const app = getApp(),
  Util = require('../../utils/util.js'),
  Ajax = require('../../utils/ajax.js').Ajax;
Page({
  data: {
    storeD: {},//店铺详情
    Value: '',
    goodsList: [],
    keyResult: '暂无数据',
    keyword: ''
  },
  onLoad: function (options) {
    const that = this;
    //设置店铺id
    that.setData({
      storeD: { sid: options.sid, lon: options.lon, lat: options.lat }
    })
  },
  //清除前后空格的方法
  trim: function (str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },
  keyword: function (e) {
    let that = this,
      _data = that.data.storeD,
      sid = _data.sid || '',
      keyword = '',
      _reg = /select|update|delete|exec|count|’|"|=|;|>|<|%/i,
      searchList = wx.getStorageSync('searchList') || [],
      keyTag = 1
      ;
    if (e.type == "blur") {
      keyword = e.detail.value || ''
    } else {
      keyword = e.currentTarget.dataset.value || ''
    }
    that.setData({
      keyTag: keyTag
    });
    //获取商品信息
    if (!keyword || _reg.test(keyword)) {//关键词--不存在或有问题
      if (keyword) {
        Util.setAlert({ content: '请不要输入奇怪的字符' });
      }
      keyTag = '';
      that.setData({
        keyword: '',
        keyTag: keyTag
      });
    } else {//关键词
      if (that.trim(keyword)) {
        if (searchList.length > 0) {
          const _index = searchList.indexOf(keyword);
          if (_index >= 0) {
            searchList.splice(_index, 1);
            searchList.unshift(keyword);
          } else {
            if (searchList.length >= 10) {
              searchList.splice(searchList.length - 1, 1);
            }
            searchList.unshift(keyword);
          }
        } else {
          searchList.unshift(keyword);
        }
        that.setData({
          searchList: searchList
        });
        wx.setStorageSync('searchList', searchList);
        Ajax({
          url: '/v1/search/ss/', method: 'get',
          data: { 1: keyword, offset: 0, limit: 9999, sid: sid, lon: _data.lon, lat: _data.lat }
        },
          function (err, json) {
            if (err) {
              Util.setAlert({ content: err || '获取店铺商品失败' })
            } else {
              //获取第一个分类下的商品 json.goods
              const carts = Util.recombine(json.goods, sid);
              //设置商品信息
              that.setData({
                cartList: carts.cartList,
                goodsList: carts.goodArr
              });
            }
          })
      } else {//输入空格
        that.setData({
          keyResult: '请输入关键词',
          keyword: ''
        });
      }
    }
  },
  list: function (e) {
    if (!e.detail.value) {
      this.setData({
        keyTag: ''
      });
    }
  },
  bindMinus: function (e) {
    const minus = Util.minus(e.currentTarget.dataset, this.data);
    this.addTotal();
    this.setData({
      goodsList: minus.goodsList
    });
  },
  bindPlus: function (e) {
    const plus = Util.plus(e.currentTarget.dataset, this.data);
    this.addTotal();
    this.setData({
      goodsList: plus.goodsList
    });
  },
  addTotal: function () {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      //上一个页面实例对象
      const prePage = pages[pages.length - 2];
      prePage.changeData();
    }
  },
  onShow: function () {
    const searchList = wx.getStorageSync('searchList') || [];
    this.setData({
      searchList: searchList
    });
  }
})