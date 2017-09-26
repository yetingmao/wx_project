// pages/user/index.js
const Bind = require("../../service/bind"),
  app = getApp();
Page({
  data: {
    user: '',
    state: 0,
    src: '../../images/user.png'
  },
  toAddress: function () {
    wx.navigateTo({
      url: '../address/index?page=user'
    })
  },
  toBind: function () {
    wx.navigateTo({
      url: '../bind/index?page=user'
    })
  },
  onLoad: function (e) {
    let that = this;
    //获取微信用户信息
    app.getUserInfo(function (data) {
      that.setData({
        src: data.avatarUrl
      })
    });
  },
  //打客服电话
  call: function (e) {
    wx.makePhoneCall({
      phoneNumber: '4006965805'
    })
  },
  bind: function () {
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
          user: data.phone,
          state: 1
        })
      } else {
        that.setData({
          state: 0
        });
      }
    })
  },

  onShow: function (e) {
    let that = this;
    //判断用户是否绑定
    if (app.TOKEN) {
      that.bind();
    } else {
      app.Token(function (_err, json) {
        if (_err) {
          wx.showModal({
            title: '提示',
            content: '获取用户信息失败，请重新登录',
            showCancel: false,
            confirmText: '关闭'
          });
        } else {
          that.bind();
        }
      }, { tag: 0 })
    }

  }
})