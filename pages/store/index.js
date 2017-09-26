//获取应用实例
let Util = require('../../utils/util.js'),
  Ajax = require('../../utils/ajax.js').Ajax,
  Bind = require('../../service/bind')
  ;
Page({
  data: {
    goodsList: [],//商品列表
    cartList: [],//购物车列表
    total: 0,//总价格
    sumT: 0,
    storeD: {},//店铺详情
    catalog: [],
    cartState: { flag: 0 },
    storeI: [],
    catalogN: '',
    cataS: 0,
    catalogId: ''
  },
  onLoad: function (options) {
    const that = this,
      cartList = [],
      storeId = parseInt(options.sid),
      lon = options['lon'],
      lat = options['lat'],
      radius = options['radius']
      ;
    //获取店铺信息
    Ajax({ url: '/v1/store/s/', method: 'get', data: { 1: storeId, lon: lon, lat: lat } },
      (err, json) => {
        Util.toast();
        let _json = [];
        if (err) {
          Util.setAlert({ content: err || '获取店铺信息失败' });
        } else {
          json.lat = lat;
          json.lon = lon;
          json.radius = radius;
          _json.push(json);
          wx.setNavigationBarTitle({
            title: json.name || '店铺'
          })
          Util.storeTime(_json,json.timestamp);
          that.setData({
            storeD: json,
            storeI: _json
          });
        }
      })

    //获取分类信息
    Ajax({ url: '/v1/store/c/', method: 'get', data: { 1: storeId } },
      (err, json) => {
        wx.hideToast();
        if (err) {
          Util.setAlert({ content: err || '获取分类信息失败' });
        } else {
          if (json && json.length > 0) {
            const _f = json[0]
            //获取第一个分类下的商品--第一个分类默认红色
            _f.active = 'cata-left';
            that.getGoods(_f.cid, storeId, function (carts) {
              that.setData({
                cartList: carts.cartList,
                total: carts.total,
                goodsList: carts.goodArr,
                sumT: carts.sumT,
                cataS: carts.cataS,
                catalogId: _f.cid,
                catalogN: _f.name
              });
            })
          }
          //页面设置分类数据
          that.setData({
            catalog: json
          });
        }
      })
    //屏幕的宽、高
    wx.getSystemInfo({
      success: (res) => {
        let height = res.windowHeight,
          width = res.windowWidth,
          _width = width / 750;
        ;
        that.setData({
          scrollHeight: height / 2 + 'px',
          goodsH: parseFloat(height - 455* _width).toFixed(2) + 'px',
          catalogH:parseFloat(height - 365 * _width).toFixed(2) + 'px',
          maxHeight: parseFloat(height - 430 * _width).toFixed(2) + 'px',
        });
      }
    })
  },
  bindMinus: function (e) {
    const minus = Util.minus(e.currentTarget.dataset, this.data)
      ;
    this.setData({
      goodsList: minus.goodsList,
      total: minus.total,
      cartList: minus.cartList,
      sumT: minus.sumT
    });
  },
  bindPlus: function (e) {
    const plus = Util.plus(e.currentTarget.dataset, this.data);
    this.setData({
      goodsList: plus.goodsList,
      total: plus.total,
      cartList: plus.cartList,
      sumT: plus.sumT
    });
  },
  cartDetail: function (e) {
    const that = this,
      data = that.data,
      cartState = data.cartState,
      _carts = wx.getStorageSync('carts'),
      carts = _carts[(data.storeD.sid)]
      , gidList = []
      ;
    if (data.sumT > 0) {
      if (cartState.flag == 1) {
        cartState.flag = 0;
      } else {
        if (carts && carts instanceof Object && Object.keys(carts).length > 0) {
          Util.eachArr(carts, (i, o) => {
            gidList.push(i);
          });
          //获取商品状态
          Ajax({ url: '/v1/store/g/', method: 'post', data: { gis: gidList } },
            (err, json) => {
              if (err) {
                Util.setAlert({ content: err || '获取商品信息失败' });
              } else {
                Util.eachArr(json, (i, o) => {
                  //status -1暂不售卖，下架
                  if (o.state < 0) {
                    carts[o.gid].state = -1;
                  }
                });
                wx.setStorageSync('carts', _carts);
              }
              this.setData({
                cartList: carts
              });
            })
        }
        cartState.flag = 1;
      }
    }
    this.setData({
      cartState: cartState
    });
  },
  clearCart: function (e) {
    let that = this,
      _data = that.data,
      sid = _data.storeD.sid,
      goodsList = _data.goodsList,
      _carts = wx.getStorageSync('carts')
      ;
    delete _carts[sid];
    Util.eachArr(goodsList, function (i, o) {
      o.num = 0;
    })
    wx.setStorageSync('carts', _carts);
    this.setData({
      cartList: [],
      goodsList: goodsList,
      total: 0,
      sumT: 0
    });
  },
  changeCata: function (e) {
    Util.toast();
    let that = this,
      _data = that.data,
      total = _data.total,
      sumT = _data.sumT,
      _cid = e.currentTarget.dataset.id,
      catalogN = '';
    //分类的active
    Util.eachArr(_data.catalog, function (i, o) {
      if (_cid == o.cid) {
        o.active = 'cata-left';
        catalogN = o.name;
      } else {
        o.active = '';
      }
    })
    that.setData({
      catalog: _data.catalog,
      catalogId: _cid,
      catalogN: catalogN
    });
    //获取其他分类下的商品
    that.getGoods(e.currentTarget.dataset.id, that.data.storeD.sid, function (carts) {
      wx.hideToast();
      that.setData({
        cartList: carts.cartList,
        total: carts.total,
        goodsList: carts.goodArr,
        sumT: carts.sumT,
        cataS: carts.cataS
      });
    })
  },
  goCart: function (e) {
    let data = this.data,
      storeD = data.storeD,
      total = data.total,
      _url = ''
      ;
    if (data.sumT > 0 && total >= storeD.bl) {
      Bind(function (err, json) {
        if (err) {
          Util.setAlert({ content: err || '获取用户信息失败' })
        } else {
          if (data.sumT > 0 && total >= storeD.bl) {
            if (json.phone) {
              _url = '../confirm/index?storeD=' + JSON.stringify(storeD);
            } else {
              _url = '../bind/index?storeD=' + JSON.stringify(storeD) + '&page=confirm'
            }
            wx.navigateTo({
              url: _url
            });
          }
        }
      })
    }


  },
  search: function (e) {
    const data = this.data;
    wx.navigateTo({
      url: '../goods/index?sid=' + data.storeD.sid + '&lat=' + data.lat + '&lon=' + data.lon + '&radius=' + data.radius
    })
  },
  changeData: function () {
    let that = this,
      _data = that.data,
      catalogId = _data.catalogId,
      carts = Util.recombine(_data.goodsList, _data.storeD.sid, catalogId);
    that.setData({
      cartList: carts.cartList,
      total: carts.total,
      goodsList: carts.goodArr,
      sumT: carts.sumT,
      cataS: carts.cataS
    })
  },
  getGoods: function (cid, storeId, cb) {
    //获取商品信息
    Ajax({ url: '/v1/store/g/', method: 'get', data: { 1: cid, limit: 9999, offset: 0 } },
      function (err, json) {
        if (err) {
          Util.setAlert({ content: err || '获取分类信息失败' })
        } else {
          //获取第一个分类下的商品 json.goods
          cb(Util.recombine(json.goods, storeId))
        }
      })
  }
})













