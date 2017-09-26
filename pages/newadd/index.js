const address = require("../../service/address")
  , Util = require('../../utils/util.js')
  ;
Page({
  data: {
    name: '',
    mobile: '',
    detail: '',
    gender: 2,
    i: 1,
    dis: false
  },
  onLoad: function (option) {
    let _json = option;
    if (_json && 'i' in _json) {
      this.setData({
        name: _json.name,
        mobile: _json.mobile,
        location_address: _json.location_address,
        detail: _json.address,
        i: _json.i,
        lat: _json.lat,
        lon: _json.lon,
        gender: _json.gender,
        id: _json.id
      })
      if (_json.gender == 1) {
        this.setData({
          man: true
        })
      } else {
        this.setData({
          man: false
        })
      }
    }
  },
  //获取姓名
  addName: function (e) {
    this.data.name = e.detail.value;
  },
  //获取性别
  checkMan: function (e) {
    this.data.gender = 1
    this.setData({
      man: true
    })
  },
  checkWoman: function (e) {
    this.data.gender = 2;
    this.setData({
      man: false
    })
  },
  //获取手机号
  addMobile: function (e) {
    this.data.mobile = e.detail.value;
  },
  //选择地址
  selectAddress: function (e) {
    let that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          location_address: res.name,
          lat: res.latitude,
          lon: res.longitude
        })
      }, fail: function (res) {
      }
    })
  },
  //详细地址
  addDetail: function (e) {
    this.data.detail = e.detail.value;
  },
  //点击确认添加
  addInfo: function () {
    let that = this
      , _json = { type: this.data.i, gender: this.data.gender }
      , reg1 = /select|update|delete|exec|count|’|"|=|;|>|<|%/i
      , reg2 = /^0?1[3|4|5|7|8][0-9]\d{8}$/
      ;
    //判断是否是修改
    if (this.data.i == 2) {
      _json.id = this.data.id;
    }
    //判断地址是否有并且合法
    if (this.data.detail && this.data.location_address) {
      if (reg1.test(this.data.detail)) {
        Util.setAlert({ content: '请输入合法字符' });
        return;
      } else {
        _json.lat = this.data.lat;
        _json.lon = this.data.lon;
        _json.location_address = this.data.location_address;
        _json.address = this.data.detail;
      }
    } else {
      Util.setAlert({ content: '请输入完整的地址' });
      return;
    };
    //判断电话是否有并且合法
    if (this.data.mobile) {
      if (reg2.test(this.data.mobile)) {
        _json.mobile = this.data.mobile;
      } else {
        Util.setAlert({ content: '请输入合法的手机号' });
        return;
      }
    } else {
      Util.setAlert({ content: '请输入手机号' });
      return;
    }
    //判断姓名是否有并且合法
    if (this.data.name) {
      if (reg1.test(this.data.name)) {
        Util.setAlert({ content: '请输入合法字符' });
      } else {
        _json.name = this.data.name;
      }
    } else {
      Util.setAlert({ content: '请输入姓名' });
    };
    that.setData({
      dis: true
    });
    setTimeout(function () {
      that.setData({
        dis: false
      });
    }, 3000)
    address(1, _json, function (err, data) {
      if (err) {
        Util.setAlert({ content: err || '添加失败' });
      } else {
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        });
        wx.navigateBack({
          delta: 1
        })
      }
    });
  },
})