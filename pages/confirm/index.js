// pages/confirm/index.js
const app = getApp(),
  Util = require('../../utils/util.js'),
  Ajax = require('../../utils/ajax.js').Ajax
  ;
Page({
  data: {
    carts: [],
    store: {},
    total: 0,
    Cart: [],
    address: '',
    CART: {},
    remark: '',
    wt: '',
    addressList: [],
    cost: 0
  },
  onLoad: function (options) {
    Util.toast();
    let that = this,
      storeD = JSON.parse(options.storeD),
      sid = storeD.sid,
      fre = storeD.fre,
      CART = wx.getStorageSync('carts'),          //所有购物车数据
      _carts = CART[sid] || {},                   //当前店铺购物车数据
      carts = [],                                 //正常销售可展示的购物车数据
      Cart = [],                                  //传给后台购物车数据
      costId = [],
      cost = 0,
      _total = 0
      ;
    Util.eachArr(_carts, function (i, o) {
      let G = {}
        ;
      G.amount = o.num;
      G.goodId = o.gid;
      G.price = o.money;
      if (!o.state || o.state > 0) {
        _total += o.num * o.money;
        carts.push(o);
        //获取当商品分类
        if (costId.length > 0) {
          if (costId.indexOf(o.cid) < 0) {
            costId.push(o.cid);
          }
        } else {
          costId.push(o.cid);
        }
        Cart.push(G);
      }
    });
    //页面设置初始化
    that.setData({
      store: storeD,
      carts: carts,         //当前店铺展示的数据
      Cart: Cart,           //当前店铺传给后台的数据
      CART: CART           //缓存数据
    })
    //获取分类信息--得到分类对应的cost
    if (carts.length > 0) {
      Ajax({ url: '/v1/store/c/', method: 'get', data: { 1: sid } },
        (err, json) => {
          wx.hideToast();
          if (err) {
            Util.setAlert({ content: err || '当前网络不给力，请稍后重试~~' });
          } else {
            if (json && json instanceof Array && json.length > 0) {
              Util.eachArr(json, function (i, o) {
                Util.eachArr(costId, function (ic, io) {
                  if (o.cid == io) {
                    cost += o.cost;
                  }
                });
              });
              //页面设置cost数据
            }
          }
          that.setData({
            cost: parseFloat(cost).toFixed(2),
            total: (parseFloat(fre) + parseFloat(_total) + parseFloat(cost)).toFixed(2)
          })
        })
    }

    that.address(sid, function (json) {
      that.setData({
        address: json && json[0],
        addressList: json
      })
    })
  },
  address: function (sid, cb) {
    Ajax({
      url: '/v1/address',
      data: {
        sid: sid,
        type: 2
      }, method: 'get'
    }, function (err, json) {
      if (err) {
        Util.setAlert({ content: err || '当前网络不给力，请稍后重试~~' })
      } else {
        if (json.address && json.address.length > 0) {
          cb(json.address)
        }
      }
    })
  },
  remark: function (e) {
    let reg = /\ud83d[\udc00-\ude4f\ude80-\udfff]/g,
      _value = e.detail.value,
      reg2 = /select|update|delete|exec|count|’|"|=|;|>|<|%/i,
      remark = '';
    if (_value) {
      if (reg2.test(_value)) {
        remark = "";
        Util.setAlert({ content: '请不要输入奇怪的字符' });
      } else {
        remark = _value.replace(reg, '')
      }
      this.setData({
        remark: remark
      })
    }
  },
  /*事件监听*///跳转确认支付页面
  toPay: function () {
    const that = this,
      _data = that.data,
      store = _data.store,
      sid = store.sid,
      address = _data.address,
      CART = _data.CART;
    //判断店铺是否营业
    Ajax({ url: '/v1/store/s/', method: 'get', data: { 1: sid, lon: store.lon, lat: store.lat } },
      function (err, json) {
        if (err) {
          Util.setAlert({ content: err || '当前网络不给力，请稍后重试~' });
        } else {
          const _wt = json.wt,
            stamp = parseInt(json.timestamp),
            date = new Date(stamp),
            time = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate(),
            start = new Date(time + ' ' + json.st).getTime(),
            _ed = json.ed == '00:00:00' ? '23:59:59' : json.ed,
            end = new Date(time + ' ' + _ed).getTime(),
            cartList = CART[sid]
            ;
          //status 判断店铺状态<0  为非营业店铺
          //wt 为是否有使用营业时间，否为所有时间都营业
          if (address && json.status > 0 && _wt && stamp >= start && stamp <= end) {
            store.prompt = '营业时间：' + json.st + '~' + json._ed;
            Ajax({
              url: '/v1/order/op/create',
              data: {
                order: {
                  addressId: address.id,
                  goods: _data.Cart,
                  remark: _data.remark,
                  storeId: sid
                }
              }, method: 'post'
            }, function (_err, _json) {
              if (_err) {
                Util.setAlert({ content: _err || '下单失败' });
              } else {
                //成功跳转支付页面--删除正常状态的商品
                Util.eachArr(cartList, function (i, o) {
                  if ('state' in o && o.state > 0 || (!o.state)) {
                    delete cartList[i];
                  }
                })
                wx.setStorageSync('carts', CART);
                const pages = getCurrentPages()
                  , prePage = pages[pages.length - 2];
                prePage.changeData();
                wx.redirectTo({
                  url: '../pay/index?id=' + _json.id
                });
              }
            })
          } else {
            store.prompt = '商家休息中';
            Util.setAlert({ content: address ? '商家休息中' : '请选择地址' })
          }
        }
      })
  },
  //跳转收货地址页面
  toAddress: function () {
    wx.navigateTo({
      url: '../address/index?page=confirm&sid=' + this.data.store.sid
    });
  },
  changeData: function (data) {
    let that = this;
    if (data) {
      that.address(that.data.store.sid, function (json) {
        Util.eachArr(json, function (i, o) {
          if (o['id'] == data) {
            that.setData({
              address: o,
              addressList: json
            })
          }
        });
      })
    }
  }
})