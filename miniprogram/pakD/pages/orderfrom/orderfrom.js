const app = getApp();
const DB = wx.cloud.database();
Page({
    data: {
        aa: 0,
        clist: [],
        list: [],
        isLoading: false,
        isToast: false,
        isTotalSure: false
    },
    index(e) {
        let index = Number(e.currentTarget.dataset.index);
        this.setData({
            'aa': index,
            'list': [],
            'clist': []
        });
        if (index == 2) {
            index = 3;
        } else if (index == 3) {
            index = 2;
        }
        this.obtainOrderByBusinessId(index);
    },
    obtainOrderByBusinessId(state = 0) {
        let that = this;
        const _ = DB.command;
        this.setData({
            'isToast': false
        })
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            DB.collection("order").where({
                userId: _.neq(app.globalData.userId),
                state: state
            }).orderBy('createTime', 'desc').get({
                success: (res) => {
                    let temp = res.data;
                    that.setData({
                        'clist': temp
                    })
                    temp.forEach((item, index) => {
                        item.goods.forEach((good, i) => {
                            if (app.globalData.openid != good.businessId) {
                                item.goods.splice(i, 1);
                            }
                        });
                        if (item.goods.length == 0) {
                            temp.splice(index, 1);
                        }
                    });
                    that.setData({
                        'list': temp,
                        'isLoading':false
                    })
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
    onLoad(options) {
        this.obtainOrderByBusinessId();
    },
    goHair(e) {
        wx.navigateTo({
            url: '../commercial/commercial?id=' + e.currentTarget.dataset.id + "&type=" + e.currentTarget.dataset.type + "&goodid=" + e.currentTarget.dataset.goodid,
        })
    },
    allorderlist: function () {
        wx.navigateTo({
            url: '../allorderlist/allorderlist?id=',
        })
    },
    // 确认发货
    sureSend(e) {
        let id = e.currentTarget.dataset.id;
        let type = e.currentTarget.dataset.type;
        let index = e.currentTarget.dataset.index;
        let jk = e.currentTarget.dataset.jk;
        let flog = true;
        if (type == "1") {
            this.data.list[index].goods.forEach((item) => {
                if (!item.isSend) {
                    flog = false;
                }
            });
            if (flog) {
                let kf = true;
                this.data.clist[index].goods.forEach((item) => {
                    if (!item.isSend) {
                        kf = false;
                    }
                });
                if (kf) {
                    DB.collection("order").where({
                        _id: id
                    }).update({
                        data: {
                            state: 1
                        },
                        success: (res) => {
                            if (res.stats.updated == 1) {
                                wx.showModal({
                                    title: '温馨提示',
                                    content: '确认订单发货成功',
                                    showCancel: false,
                                    confirmColor: '#497749',
                                    duration: 1000,
                                })
                            } else {
                                wx.showModal({
                                    title: '温馨提示',
                                    content: '确认订单发货失败，错误',
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
                        content: '确认订单发货成功',
                        showCancel: false,
                        confirmColor: '#497749',
                        duration: 1000,
                    })
                }
            } else {
                wx.showModal({
                    title: '温馨提示',
                    content: '确认订单发货失败，请确认全部货物已发货',
                    showCancel: false,
                    confirmColor: '#497749',
                    duration: 1000,
                })
            }
        } else if (type == "3") {
            let k = [];
            this.data.list[index].goods.forEach((item) => {
                item.isExit = true;
                k.push(item.id);
            });
            let kf = true;
            this.data.clist[index].goods.forEach((item) => {
                if (k.includes(item.id)) {
                    item.isExit = true;
                }
            });
            this.setData({
                list: this.data.list,
                clist: this.data.clist
            })
            this.data.clist[index].goods.forEach((item) => {
                if (!item.isExit) {
                    kf = false;
                }
            });
            if (kf) {
                DB.collection("order").where({
                    _id: id
                }).update({
                    data: {
                        isExitOrder: true,
                        goods: this.data.clist.goods
                    },
                    success: (res) => {
                        if (res.stats.updated == 1) {
                            wx.showModal({
                                title: '温馨提示',
                                content: '订单取消成功',
                                showCancel: false,
                                confirmColor: '#497749',
                                duration: 1000,
                            })
                        } else {
                            wx.showModal({
                                title: '温馨提示',
                                content: '订单取消失败',
                                showCancel: false,
                                confirmColor: '#497749',
                                duration: 1000,
                            })
                        }
                    }
                });
            } else {
                DB.collection("order").where({
                    _id: id
                }).update({
                    data: {
                        goods: this.data.clist.goods
                    },
                    success: (res) => {
                        if (res.stats.updated == 1) {
                            wx.showModal({
                                title: '温馨提示',
                                content: '订单取消成功',
                                showCancel: false,
                                confirmColor: '#497749',
                                duration: 1000,
                            })
                        } else {
                            wx.showModal({
                                title: '温馨提示',
                                content: '订单取消失败',
                                showCancel: false,
                                confirmColor: '#497749',
                                duration: 1000,
                            })
                        }
                    }
                });
            }
        } else if (type == "4") {
            let text = "";
            let k = [];
            let kf = true;
            let whereObj = {}
            if (jk == 1) {
                text = "是否接收退货请求";
                this.data.list[index].goods.forEach((item) => {
                    k.push(item.id);
                    item.isExitGood = true;
                });
                this.data.clist[index].goods.forEach((item) => {
                    if (k.includes(item.id)) {
                        item.isExitGood = true;
                    }
                });
                this.setData({
                    list: this.data.list,
                    clist: this.data.clist
                })
                this.data.clist[index].goods.forEach((item) => {
                    if (!item.isExitGood) {
                        kf = false;
                    }
                });
                whereObj = {
                    isExitG:true,
                    goods: this.data.clist.goods
                }
            } else if (jk == 2) {
                text = "是否接收退款请求";
                this.data.list[index].goods.forEach((item) => {
                    k.push(item.id);
                    item.isExitMoney = true;
                });
                this.data.clist[index].goods.forEach((item) => {
                    if (k.includes(item.id)) {
                        item.isExitMoney = true;
                    }
                });
                this.setData({
                    list: this.data.list,
                    clist: this.data.clist
                })
                this.data.clist[index].goods.forEach((item) => {
                    if (!item.isExitMoney) {
                        kf = false;
                    }
                });
                whereObj = {
                    isExitM:true,
                    goods: this.data.clist.goods
                }
            }
            if (kf) {
                DB.collection("order").where({
                    _id: id
                }).update({
                    data: whereObj,
                    success: (res) => {
                        if (res.stats.updated == 1) {
                            wx.showModal({
                                title: '温馨提示',
                                content: '操作成功',
                                showCancel: false,
                                confirmColor: '#497749',
                                duration: 1000,
                            })
                        } else {
                            wx.showModal({
                                title: '温馨提示',
                                content: '操作失败',
                                showCancel: false,
                                confirmColor: '#497749',
                                duration: 1000,
                            })
                        }
                    }
                });
            } else {
                DB.collection("order").where({
                    _id: id
                }).update({
                    data: {
                        goods: this.data.clist.goods
                    },
                    success: (res) => {
                        if (res.stats.updated == 1) {
                            wx.showModal({
                                title: '温馨提示',
                                content: '操作成功',
                                showCancel: false,
                                confirmColor: '#497749',
                                duration: 1000,
                            })
                        } else {
                            wx.showModal({
                                title: '温馨提示',
                                content: '操作失败',
                                showCancel: false,
                                confirmColor: '#497749',
                                duration: 1000,
                            })
                        }
                    }
                });
            }
        }
    },
    onReady: function () {

    },
    onShow: function () {},

    onHide: function () {

    },

    onUnload: function () {

    },

    onPullDownRefresh: function () {

    },

    onReachBottom: function () {

    },

    onShareAppMessage: function () {

    }
})