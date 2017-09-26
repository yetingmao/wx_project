
module.exports = {
    // 设置启动页缓存
    cookie: () => {
        wx.setStorage({
            key: "figure",
            data: "1"
        })
    },
    // 调用启动页缓存
    getCookie: () => {
        return wx.getStorageSync('figure');
    },
    //转化商品列表数据
    //goods:商品列表 prompt
    recombine: (goods, storeId) => {
        let _carts = wx.getStorageSync('carts') || {},
            carts = _carts instanceof Object && Object.keys(_carts).length > 0 ? _carts[storeId] : {},   //购物车数据   
            goodArr = [],
            cartList = [],
            total = 0,
            sumT = 0,
            reg = /[('<tags>')|('</tags>')]/g                     //搜索带标签
            ;
        if (goods && goods.length > 0) {
            for (var i = 0, len = goods.length; i < len; i++) {
                var _g = goods[i],
                    _id = _g.gid,
                    goodInfo = {}
                    , _num = 0
                    , _left = parseFloat(_g.amount);
                if (carts instanceof Object && Object.keys(carts).length > 0 && carts[_id]) {  //购物车中有商品列表里的数据
                    _num = parseFloat(carts[_id]['num']);
                }
                goodInfo = {
                    name: _g.name.replace(reg, '') || '',
                    money: _g.money || 0,
                    cid: _g.cid || '',
                    ori: parseFloat(_g.yjPrice) > parseFloat(_g.money) ? _g.yjPrice : 0,
                    gid: _id || '',
                    amount: _left || 0,
                    num: _num,                                          //商品购买数量
                    dsr: _left - _num > 10 ? 1 : 0,                     //商品数量小于等于库存，加disabled
                }
                goodArr[i] = goodInfo;                                  //数组格式商品列表
            }
        }
        //初始化的时候，cartList为缓存数据
        if (carts instanceof Object && Object.keys(carts).length > 0) {
            module.exports.eachArr(carts, function (i, o) {
                cartList.push(o);
                total += o.num * o.money;
                sumT += o.num;
            });
        }
        return { goodArr: goodArr, total: parseFloat(total).toFixed(2), cartList: cartList, sumT: sumT, cataS: goods.length };
    },
    isArray: (value) => {
        // 判断是不是伪数组
        return "length" in value && value.length >= 0;
    }
    , isObject: (value) => {
        return value !== null && typeof value === 'object'
    }, eachArr: (obj, cb) => {
        var i, length;
        if (module.exports.isArray(obj)) {
            // 遍历数组或伪数组
            for (i = 0, length = obj.length; i < length; i++) {
                if (cb.call(obj[i], i, obj[i]) === false) {
                    break;
                }
            }
        } else {
            // 遍历对象
            for (i in obj) {
                if (cb.call(obj[i], i, obj[i]) === false) {
                    break;
                }
            }
        }
        // 直接返回第一个参数
        return obj;
    },
    //按钮减
    minus: (dataset, data) => {
        let id = parseInt(dataset.id),//商品id
            storeId = data.storeD.sid || '',
            goodsList = data.goodsList,                                     //商品列表
            _carts = wx.getStorageSync('carts'),
            carts = _carts[storeId],                                       //购物车数据   
            cartArr = [],
            num,
            dsr,
            good,
            storeList = wx.getStorageSync('storeList') || [],
            index = storeList.indexOf(storeId),
            ____num = 0,
            __i = 0;
        ;
        __i++;
        //商品在购物车列表里----循环商品列表，修改加入购物车商品数据
        module.exports.eachArr(goodsList, function (i, o) {
            if (id == o['gid']) {
                good = o;                                                   //获取商品信息
                num = o.num || 0;                                           //获取商品数量
                ____num = num;
                const amount = o.amount;
                // 如果只有1件了，就不允许再减了
                if (num > 0) {
                    num--;
                }
                //改变订单列表
                goodsList[i].num = num;
                //todo 加号按钮替换图片
                goodsList[i].dsr = num >= amount ? 'dispaly' : '';           //加号按钮是否可以操作
            }
        });

        if (index >= 0) {
            if (num <= 0) {//判断购物车里是否有该店铺其他商品
                if (Object.keys(carts).length <= 1) {//只有该商品--删除数据
                    storeList.splice(index, 1);
                }
            }
        }
        wx.setStorageSync('storeList', storeList)
        // 购物车数据
        if (carts[id]) {
            if (good) {
                if (num <= 0) {
                    delete carts[id];
                } else {
                    carts[id].num = num;
                }
            } else {
                //商品不在当前商品列表
                num = carts[id].num;
                ____num = num;
                if (num > 0) {
                    num--;
                }
                carts[id].num = num;
                good = carts[id];
                if (num == 0) {
                    delete carts[id];
                }
            }
        }

        //获取购物车-数组
        module.exports.eachArr(carts, function (i, o) {
            cartArr.push(o);
        });
        _carts[storeId] = carts;
        wx.setStorageSync('carts', _carts);
        let total = parseFloat(data.total || 0), sumT = parseFloat(data.sumT || 0);
        if (__i <= ____num) {
            total = total - parseFloat(good.money);
            sumT = sumT - 1;
        }
        return { cartList: cartArr, total: parseFloat(total).toFixed(2), goodsList: goodsList, sumT: sumT };
    },
    //按钮+
    plus: (dataset, data) => {
        let id = parseInt(dataset.id),                                      //商品id
            storeId = data.storeD.sid || '',
            goodsList = data.goodsList,                                     //商品列表
            _carts = wx.getStorageSync('carts') || {},
            carts = _carts instanceof Object && Object.keys(_carts).length > 0 ? (_carts[storeId] || {}) : {},   //购物车数据   
            cartArr = [],
            num,
            dsr,
            good,
            total = data.total,
            sumT = data.sumT,
            storeList = wx.getStorageSync('storeList') || [],
            _index = storeList.indexOf(storeId),
            _len = storeList.length
            ;
        //购物车超过10个，删除最旧的
        if (_index < 0) {
            storeList.unshift(storeId);
            if (storeList.length > 9) {
                delete _carts[storeList[_len]];
                storeList.pop();
            }
        }
        wx.setStorageSync('storeList', storeList)
        //循环商品列表，修改加入购物车商品数据
        module.exports.eachArr(goodsList, function (i, o) {
            if (id == o['gid']) {
                good = o;                                                   //获取商品信息
                num = o.num || 0;                                           //获取商品数量
                const amount = o.amount;
                if (num < amount) {                                           // 自增
                    num++;
                    total = parseFloat(data.total) + parseFloat(good.money);
                    sumT = parseFloat(data.sumT) + 1;
                }
                //改变订单列表
                goodsList[i].num = num;
                //todo 加号按钮替换图片
                goodsList[i].dsr = num >= amount ? 'disabled' : '';           //减号按钮是否可以操作
            }
        });
        //改变购物车
        let _gtag = '';
        if (carts[id]) {
            carts[id].num = num;
        } else {
            carts[id] = good;
        }
        //获取购物车-数组
        module.exports.eachArr(carts, function (i, o) {
            cartArr.push(o);
        });
        //设置缓存
        _carts[storeId] = carts;
        wx.setStorageSync('carts', _carts);
        return { cartList: cartArr, total: parseFloat(total).toFixed(2), goodsList: goodsList, sumT: sumT };
    },
    setAlert: (data) => {
        wx.showModal({
            title: data.title || '提示',
            content: data.content,
            showCancel: data.showCancel || false,
            confirmText: data.confirmText || '关闭'
        });
    },
    storeTime: (storeList, timestamp) => {
        module.exports.eachArr(storeList, function (i, o) {
            timestamp = timestamp ? timestamp : o.stimestamp;
            const _wt = o.wt,
                stamp = new Date(parseInt(timestamp)),
                time = stamp.getFullYear() + '/' + (stamp.getMonth() + 1) + '/' + stamp.getDate(),
                start = new Date(time + ' ' + o.st).getTime(),
                _ed = o.ed == '00:00:00' ? '23:59:59' : o.ed,
                end = new Date(time + ' ' + _ed).getTime(),
                dst = parseFloat(o.dst);
            o.ed = _ed;
            if (o.status > 0 && _wt && timestamp >= start && timestamp <= end) {
                o.prompt = '营业时间：' + o.st + '~' + o.ed;
                o.tag = 1;
            } else {
                o.prompt = "商家休息中";
                o.tag = 0;
            }
            o.company = dst >= 1000 ? 'km' : 'm';
            o.dst = dst >= 1000 ? (dst / 1000).toFixed(2) : dst.toFixed(2);

        })
    },
    toast: function () {
        wx.showToast({
            'title': '正在加载',
            'icon': 'loading',
            'duration': 10000,
            'mask': true
        });
    }
}