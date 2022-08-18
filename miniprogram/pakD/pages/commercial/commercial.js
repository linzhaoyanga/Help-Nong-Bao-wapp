// pages/prosn/prosn.js
const DB = wx.cloud.database();
const app = getApp()
Page({
    data: {
        result: '',
        array: ['中通快递', '申通快递', '圆通快递', '顺丰快递', '韵达快递', '邮政', '京东快递', '极兔快递'],
        objectArray: [{
                id: 0,
                name: '中通快递'
            },
            {
                id: 1,
                name: '申通快递'
            },
            {
                id: 2,
                name: '圆通快递'
            },
            {
                id: 3,
                name: '顺丰快递'
            },
            {
                id: 4,
                name: '韵达快递'
            },
            {
                id: 5,
                name: '邮政'
            },
            {
                id: 6,
                name: '京东快递'
            },
            {
                id: 7,
                name: '中通快递'
            },
            {
                id: 8,
                name: '极兔快递'
            }
        ],
        address: [],
        id: '',
        goodid: ''
    },
    aaa: function (e) {
        this.setData({
            result: e.detail.value
        })
    },
    //扫一扫获取信息
    getscancode: function () {
        var _this = this;
        wx.scanCode({
            success: (res) => {
                var result = res.result;
                _this.setData({
                    result: result,
                })
            }
        })
    },
    onLoad(e) {
        this.setData({
            id: e.id,
            goodid: e.goodid
        });
        if (e.type == "1") {
            wx.setNavigationBarTitle({
                title: '待发货',
            })
        } else if (e.type == "2") {
            wx.setNavigationBarTitle({
                title: '待收货',
            })
        }
        this.obtainAddress();
    },
    obtainAddress() {
        DB.collection("order").where({
            _id: this.data.id
        }).get({
            success: (res) => {
                this.setData({
                    address: res.data[0].address,
                });
            },
            //失败
            fail: (err) => {
                console.log(err);
            }
        });
    },
    //无需寄件提示框
    showtip: function () {
        var that = this
        wx.showModal({
            title: '提示',
            content: '是否确定见面交易',
            success(res) {
                var id = that.data.id
                console.log('id', id)
                if (res.confirm) {
                    console.log('用户点击确定')
                    DB.collection('order').where({
                        _id: id
                    }).update({
                        // data 传入需要局部更新的数据
                        data: {
                            // 表示增加的字段
                            state: 1,
                            oderAdd: '无需寄件'
                        },
                        success: function (res) {
                            console.log(res)
                            if (res.stats.updated == 1) {
                                wx.showToast({
                                    title: '提交成功',
                                    duration: 1000,
                                    success: (res) => {
                                        wx.navigateBack();
                                    }
                                });
                            }
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    //提交按钮
    show() {
        var that = this
        wx.showModal({
            title: '温馨提示',
            content: '是否确认信息',
            confirmColor: '#497749',
            duration: 1000,
            success(res) {
                if (res.confirm) {
                    var id = that.data.id
                    var result = that.data.result
                    if (result != '') {
                        let temp = [];
                        DB.collection("order").where({
                            _id: id
                        }).get({
                            success: (res) => {
                                let temp = res.data[0];
                                temp.goods.forEach((good, i) => {
                                    if (good.id == that.data.goodid) {
                                        temp.goods[i].sendId = that.data.result;
                                        temp.goods[i].isSend = true;
                                        temp.goods[i].sendTime = app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
                                    }
                                });
                                DB.collection("order").where({
                                    _id: id
                                }).update({
                                    data: {
                                        goods: temp.goods
                                    },
                                    success: (res) => {
                                        if (res.stats.updated == 1) {
                                            wx.showModal({
                                                title: '温馨提示',
                                                content: '发货成功',
                                                showCancel: false,
                                                confirmColor: '#497749',
                                                duration: 1000,
                                                success: (res) => {
                                                    wx.navigateBack({
                                                      delta: 0,
                                                    })
                                                }
                                            })
                                        } else {
                                            wx.showModal({
                                                title: '温馨提示',
                                                content: '发货失败',
                                                showCancel: false,
                                                confirmColor: '#497749',
                                                duration: 1000,
                                                success: (res) => {
                                                    wx.navigateBack({
                                                        delta: 0,
                                                      })
                                                }
                                            })

                                        }
                                    }
                                })
                            },
                            //失败
                            fail: (err) => {
                                console.log(err);
                            }
                        });

                    } else {
                        console.log(result)
                        wx.showToast({
                            title: '请填写快递号',
                            duration: 1000
                        });
                    }
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    //选择快递公司的参数
    bindPickerChange: function (e) {
        this.setData({
            index: e.detail.value
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})