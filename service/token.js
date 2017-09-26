/**
 * Created by yns on 2017/2/21.
 */
const App = getApp();
module.exports = {
    Login: (callback) => {
        let _err, code;
        wx.login({
            complete: (res) => {
                if (res.code) {

                    code = res.code;
                } else {
                    _err = res.errMsg || '获取微信信息失败，请重新登陆小程序';
                }
                callback(_err, code)
            }
        });
    },
    Token: () => {
        module.exports.Login((err, json) => {
            let _err, _data;
            if (err) {
                _err = err || '获取回传数据失败';
            } else {
                wx.request({
                    url: App.BASE_URL + '/v1/auth/wx',
                    method: 'POST',
                    data: {
                        code: json
                    },
                    complete: function (res) {
                        if (res && res.data && res.data.status > 0) {
                            _data = res.data.data;
                            App.TOKEN = res.data.data;
                        } else {//status==-1为token失效
                            _err = res.data && res.data.message || res.errMsg || '获取回传数据失败';
                        }

                    }
                });
            }

        })

    }
};
