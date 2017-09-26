// pages/goods/index.js
const app = getApp(),
  reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/,
  reg2 = /^\d{4}$/,
  Ajax = require('../../utils/ajax.js').Ajax,
  Util = require('../../utils/util.js')
  ;
Page({
  data: {
    bind: { phone: '', code: '' },
    tag: { phone: '', code: '' },
    code: { text: '获取验证码', flag: 1 },
    prompt: '',
    page: '',
    TIME: '',
  },
  onLoad: function (options) {
    this.setData({
      page: {
        page: options.page,
        total: options.total,
        storeD: options.storeD
      }
    })
  },
  //事件处理函数
  phone: function (e) {
    let _value = e.detail.value,
      _data = this.data,
      bind = _data.bind,
      tag = _data.tag
      , prompt = '';
    if (_value) {
      let len = _value.length;
      tag.phone = _value;
      if (len == 11) {
        if (reg.test(_value)) {
          bind.phone = _value;
        } else {
          tag.phone = '';
          bind.phone = '';
          prompt = "手机号码格式错误";
        }
      } else {
        bind.phone = _value;
      }
      this.setData({
        tag: tag,
        bind: bind,
        prompt: prompt
      });
    } else {
      bind.phone = '';
      tag.phone = '';
      this.setData({
        bind: bind,
        tag: tag
      });
    }
  },
  deleteP: function () {
    let _data = this.data,
      bind = _data.bind,
      tag = _data.tag;
    bind['phone'] = tag['phone'] = '';
    this.setData({
      bind: bind,
      tag: tag
    });
  },
  deleteC: function () {
    let _data = this.data,
      bind = _data.bind,
      tag = _data.tag;
    bind['code'] = tag['code'] = '';
    this.setData({
      bind: bind,
      tag: tag
    });
  },
  //获取验证码
  code: function (e) {
    let _value = e.detail.value,
      _data = this.data,
      bind = _data.bind,
      tag = _data.tag,
      prompt = '';
    if (_value) {
      tag.code = _value;
      let len = _value.length;
      if (len == 4) {
        if (reg2.test(_value)) {
          bind.code = _value;
        } else {
          tag.code = '';
          bind.code = '';
          prompt = "验证码格式错误";
        }
      } else {
        bind.code = _value;
      }
      this.setData({
        tag: tag,
        bind: bind,
        prompt: prompt
      });
    } else {
      bind.code = '';
      tag.code = '';
      this.setData({
        bind: bind,
        tag: tag
      });
    }
  },
  setTime: function (i, cb) {
    let that = this,
      time = setInterval(function () {
        i = parseFloat(i);
        i--;
        if (i <= 0) {
          clearInterval(time);
          cb('获取验证码', 1, time)
        } else {
          cb(i + '秒后可重新获取', 0, time)
        }
        that.setData({
          TIME: i
        });
      }, 1000)
  },
  //点击获取验证码事件
  getCode: function (e) {
    const that = this,
      _data = that.data,
      phone = _data.bind.phone,
      TIME = _data.TIME,
      T = 120;
    if (TIME || !phone) {
      if (!phone) {
        Util.setAlert({ content: '请输入手机号码' });
      } else {
        Util.setAlert({ content: '请倒计时结束后再请求' });
      }
    } else {
      if (reg.test(phone)) {
        Ajax({
          url: '/v1/auth/sms/get', method: 'post',
          data: { phone: phone }
        },
          function (err, json) {
            if (err) {
              that.setData({ prompt: err || '获取验证码失败' });
            } else {
              //成功之后，倒计时
              that.setTime(T, function (t, o) {
                that.setData({
                  code: {
                    text: t,
                    flag: o
                  }
                });
              });
            }
          })
      } else {
        Util.setAlert({ content: '请输入正确的手机号码' });
      }
    }
  },
  //点击绑定手机号
  toBind: function (e) {
    //todo 绑定手机号三次以后处理不能绑定
    let that = this,
      _data = that.data,
      bind = _data.bind,
      page = _data.page,
      toU = '';
    clearInterval(_data.TIME);
    if (bind.code && bind.phone && bind.code.length == 4 && bind.phone.length == 11) {
      Ajax({
        url: '/v1/auth/sms/bind', method: 'post',
        data: _data.bind
      },
        function (err, json) {
          if (err) {
            that.setData({ prompt: err || '绑定手机失败' });
          } else {
            that.setData({ bind: { phone: '', code: '' } });
            App.TOKEN = '';
            //todo 绑定手机号成功 获取token，设置token，跳转至来的页面
            app.Token(function (err, json) {
              if (err) {
                Util.setAlert({ content: err || '当前网络不给力，请稍后重试~~' });
              } else {//获取token成功
                App.TOKEN = json;
                if (page.page && page.page == 'confirm') {
                  wx.redirectTo({
                    url: '../' + page.page + '/index?page=bind' + (page.storeD ? '&storeD=' + page.storeD : '') + (page.total ? '&total=' + page.total : '')
                  })
                } else {
                  wx.switchTab({
                    url: '../' + (page.page || 'index') + '/index'
                  })
                }
              }
            }, {tag:0});
          }
        })
    }
  },
  onShow: function () {

  }
})