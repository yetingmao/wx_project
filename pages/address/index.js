// pages/address/index.js
const userAddress = require("../../service/address"),
  Util = require('../../utils/util.js')
  ;
Page({
  data: {
    address: [],
    state: 0,
    selectI: {},
    addressId: '',
    type: 1
  },
  //添加新地址跳转到新页面
  add: function () {
    wx.navigateTo({
      url: '../newadd/index'
    })
  },
  change: function (e) {
    let _data = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../newadd/index?i=2&name=' + _data.name + '&gender=' + _data.gender + '&mobile=' + _data.mobile + '&location_address=' + _data.location_address + '&lat=' + _data.location.lat + '&lon=' + _data.location.lon + '&address=' + _data.address + '&id=' + _data.id
    })
  },
  select: function (e) {
    let index = e.currentTarget.dataset.id,
      _data = this.data,
      address = _data.address,
      pages = getCurrentPages(),
      _page = _data.page,
      addressId = '';
    Util.eachArr(address, function (i, o) {
      if (i == index) {
        if (address[i]['flag']) {
          address[i]['flag'] = '';
          addressId = '';
        } else {
          address[i]['flag'] = 1;
          addressId = o.id;
        }
      } else {
        address[i]['flag'] = '';
        addressId = '';
      }
      //从结算页面来
      if (_page == 'confirm' && addressId && (pages.length > 1)) {
        const prePage = pages[pages.length - 2];
        prePage.changeData(addressId);
      }
    })
    this.setData({
      address: address,
      addressId: addressId
    })
  },
  //ajax请求获取地址列表
  Address: function (json) {
    let that = this;
    userAddress(0, json, function (err, data) {
      if (err) {
        wx.showModal({
          title: '提示',
          content: err || '当前网络不给力，请稍后重试~~',
          showCancel: false,
          confirmText: '关闭'
        });
      } else {
        if (data && 'address' in data && data.address.length > 0) {
          Util.eachArr(data.address, function (i, o) {
            o.index = i;
          })
          that.setData({
            address: data.address
          })
        } else {
          that.setData({
            address: []
          })
        }
      }
    });
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    let that = this,
      page = options.page;
    if (page == 'user') {
      //从个人中心过来
      this.setData({
        temp: page,
        type: 1
      })
    } else {
      //从结算页面过来
      let sid = options.sid;
      this.setData({
        page: page,
        type: 2,
        sid: sid
      })
    }
  },
  onShow: function () {
    let _json = {};
    _json.type = this.data.type;
    if (this.data.sid) {
      _json.sid = this.data.sid;
    }
    this.Address(_json);
  },
  onHide: function () {
    address: []
  },
})