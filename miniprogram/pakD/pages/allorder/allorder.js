// pakA/pages/allorder/allorder.js
const app = getApp();
const DB = wx.cloud.database();
Page({
    data: {
        index: ['待发货', '待收货', '已完成', '退货/退款', ],
        indty: 0,
        list: [],
        isLoading: false,
        isToast: false,
        kkkk: false
    },
    changindex(e) {
        let index = Number(e.currentTarget.dataset.index);
        this.setData({
            indty: index,
            list: [],
            listto: [],
        });
        this.obtainOrderByBusinessId(index);
    },
    obtainOrderByBusinessId(state = 0) {
        this.setData({
            'isToast': false
        })
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            DB.collection("order").where({
                userId: app.globalData.userId,
                state: state
            }).orderBy("createTime", "desc").get({
                success: (res) => {
                    this.setData({
                        list: res.data,
                        'isLoading': false
                    });
                    if (this.data.list.length == 0) {
                        this.setData({
                            'isToast': true
                        })
                    }
                },
                //失败
                fail: (err) => {
                    console.log(err);
                }
            });
        }

    },
    goSure(e) {
        let id = e.currentTarget.dataset.id;
        let index = e.currentTarget.dataset.index;
        let i = e.currentTarget.dataset.i;
        let goodid = e.currentTarget.dataset.goodid;
        var that = this;
        wx.showModal({
            title: '温馨提示',
            content: '是否确定收货',
            confirmColor: '#497749',
            duration: 1000,
            success: (res) => {
                if (res.confirm) {
                    that.data.list[index].goods[i].userIsUse = true;
                    DB.collection("order").where({
                        _id: id
                    }).update({
                        data: {
                            goods: that.data.list[index].goods
                        },
                        success: (res) => {
                            if (res.stats.updated == 1) {
                                wx.showModal({
                                    title: '温馨提示',
                                    content: '收货成功',
                                    showCancel: false,
                                    confirmColor: '#497749',
                                    duration: 1000,
                                    success: (res) => {
                                        this.setData({
                                            list: this.data.list
                                        })
                                    }
                                })
                            } else {
                                wx.showModal({
                                    title: '温馨提示',
                                    content: '收货失败',
                                    showCancel: false,
                                    confirmColor: '#497749',
                                    duration: 1000,
                                })
                            }
                        }
                    })

                } else {

                }
            }
        })
    },
    sure(e) {
        let id = e.currentTarget.dataset.id;
        let type = e.currentTarget.dataset.type;
        let index = e.currentTarget.dataset.index;
        let k = e.currentTarget.dataset.k;
        let obj = this.data.list[index];
        let flog = true;
        if (type == "1") {
            wx.showModal({
                title: '温馨提示',
                content: '是否取消订单',
                confirmColor: '#497749',
                duration: 1000,
                success: (res) => {
                    if (res.confirm) {
                        DB.collection("order").where({
                            _id: id
                        }).update({
                            data: {
                                isExit: true
                            },
                            success: (res) => {
                                if (res.stats.updated == 1) {
                                    wx.showModal({
                                        title: '温馨提示',
                                        content: '取消订单申请已提交，请耐心等待',
                                        showCancel: false,
                                        confirmColor: '#497749',
                                        duration: 1000,
                                    })
                                } else {
                                    wx.showModal({
                                        title: '温馨提示',
                                        content: '取消订单申请失败，请重新提交',
                                        showCancel: false,
                                        confirmColor: '#497749',
                                        duration: 1000,
                                    })
                                }
                            }
                        });
                    }
                }
            })

        } else if (type == "2") {
            this.data.list[index].goods.forEach((item) => {
                if (!item.userIsUse) {
                    flog = false;
                }
            });
            if (flog) {
                DB.collection("order").where({
                    _id: id
                }).update({
                    data: {
                        state: 2
                    },
                    success: (res) => {
                        if (res.stats.updated == 1) {
                            wx.showModal({
                                title: '温馨提示',
                                content: '确认订单收货成功',
                                showCancel: false,
                                confirmColor: '#497749',
                                duration: 1000,
                            })
                        } else {
                            wx.showModal({
                                title: '温馨提示',
                                content: '确认订单收货失败，错误',
                                showCancel: false,
                                confirmColor: '#497749',
                                duration: 1000,
                            })
                        }
                    }
                });
            } else {
                wx.showModal({
                    title: '温馨提示',
                    content: '确认订单收货成功',
                    showCancel: false,
                    confirmColor: '#497749',
                    duration: 1000,
                })
            }
            this.setData({
                'kkkk': true
            })
        } else if (type == "3") {
            let text = "是否退款";
            let objw = {
                isExitMoney: true,
                state: 3
            }
            if (k == 2) {
                text = "是否退货";
                objw = {
                    isExitGood: false,
                    state: 3
                }
            }
            if (obj.isExitGood && !obj.isExitMoney) {
                if (k == 1) {
                    wx.showModal({
                        title: '温馨提示',
                        content: "你已发起退货请求，无法发起退款请求",
                        confirmColor: '#497749',
                        showCancel: false,
                        duration: 1000,
                    });
                    return;
                }
            } else if (!obj.isExitGood && obj.isExitMoney) {
                if (k == 2) {
                    wx.showModal({
                        title: '温馨提示',
                        content: "你已发起退款请求，无法发起退货请求",
                        showCancel: false,
                        confirmColor: '#497749',
                        duration: 1000,
                    });
                    return;
                }
            } else if (obj.isExitGood || obj.isExitMoney) {
                if (k == 2) {
                    wx.showModal({
                        title: '温馨提示',
                        content: "无法发起重复请求",
                        showCancel: false,
                        confirmColor: '#497749',
                        duration: 1000,
                    });
                    return;
                }
            }

            wx.showModal({
                title: '温馨提示',
                content: text,
                confirmColor: '#497749',
                duration: 1000,
                success: (res) => {
                    if (res.confirm) {
                        DB.collection("order").where({
                            _id: id
                        }).update({
                            data: objw,
                            success: (res) => {
                                if (res.stats.updated == 1) {
                                    if (k == 1) {
                                        wx.showModal({
                                            title: '温馨提示',
                                            content: '退款申请已提交，请耐心等待',
                                            showCancel: false,
                                            confirmColor: '#497749',
                                            duration: 1000,
                                        })
                                    } else if (k == 2) {
                                        wx.showModal({
                                            title: '温馨提示',
                                            content: '退货申请已提交，请耐心等待',
                                            showCancel: false,
                                            confirmColor: '#497749',
                                            duration: 1000,
                                        })
                                    }

                                } else {
                                    if (k == 1) {
                                        wx.showModal({
                                            title: '温馨提示',
                                            content: '退款申请提交失败',
                                            showCancel: false,
                                            confirmColor: '#497749',
                                            duration: 1000,
                                        })
                                    } else if (k == 2) {
                                        wx.showModal({
                                            title: '温馨提示',
                                            content: '退货申请提交失败',
                                            showCancel: false,
                                            confirmColor: '#497749',
                                            duration: 1000,
                                        })
                                    }
                                }
                            }
                        });
                    }
                }
            })
        }
    },
    onLoad(e) {
        this.obtainOrderByBusinessId();
    },
    goHair(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../../pages/allorderlist/allorderlist?id=' + id,
        })
    },


    onReady() {

    },


    onShow() {
        this.setData({
            list: [],
            listto: [],
        });
        this.obtainOrderByBusinessId(this.data.indty);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})