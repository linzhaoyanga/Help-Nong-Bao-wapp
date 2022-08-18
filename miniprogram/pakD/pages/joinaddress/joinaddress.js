// pages/individual/individual.js
const app = getApp()
const DB = wx.cloud.database();
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../../share/index"
Page({
    data: {
        isLoading: false,
        username: '',
        phone: '',
        region: ['请选择所在地区', '', ''],
        detailAddress: '',
        default: false,
        flog: false,
        k: false,
        addressId: '',
        typess: ""
    },
    //选择县区
    bindRegionChange: function (e) {
        this.setData({
            region: e.detail.value
        })
    },
    getUserProvince: function (e) {
        this.setData({
            region: e.detail.value //将用户选择的省市区赋值给region
        })
    },
    torrgleChoose() {
        this.setData({
            'default': !this.data.default
        })
    },
    //提交信息代码
    submit: function () {
        let that = this;
        if (this.data.username == '' ||
            this.data.phone == '' ||
            this.data.region[2] == '' ||
            this.data.detailAddress == '') {
            wx.showModal({
                title: '提示',
                content: '信息录入不完整，注意每一项都为必填项，请检查后再提交',
                showCancel: false,
                confirmColor: '#497749'
            })
            return
        }
        let obj = {
            userId: app.globalData.userId,
            username: that.data.username,
            phone: that.data.phone,
            easyAddress: that.data.region,
            detailAddress: that.data.detailAddress,
            flog: that.data.default
        }
        wx.showModal({
            title: '温馨提示',
            content: '是否确定提交',
            confirmColor: '#497749',
            success: (res) => {
                if (res.confirm) {
                    if (that.data.default) {
                        DB.collection("address").where({
                            userId: app.globalData.userId
                        }).update({
                            data: {
                                flog: false
                            },
                            success: (res) => {
                                DB.collection("address").add({
                                    data: obj,
                                    success: (res) => {
                                        obj._id = res._id
                                        wx.showToast({
                                            title: '提交成功',
                                            duration: 1000,
                                            success: (res) => {
                                                that.updateAddress(obj);
                                                wx.navigateBack();
                                            }
                                        })
                                    },
                                    fail: (err) => {
                                        wx.showToast({
                                            title: '提交失败',
                                            icon: 'error',
                                            duration: 1000,
                                        })
                                    }
                                })
                            },
                            fail: (err) => {
                                console.log(err);
                            }
                        })
                    } else {
                        DB.collection("address").add({
                            data: obj,
                            success: (res) => {
                                wx.showToast({
                                    title: '提交成功',
                                    duration: 1000,
                                    success: (res) => {
                                        wx.navigateBack();
                                    }
                                })
                            },
                            fail: (err) => {
                                wx.showToast({
                                    title: '提交失败',
                                    icon: 'error',
                                    duration: 1000,
                                })
                            }
                        })
                    }
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.changeMode();
        this.pdAddress();
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['address'],
            actions: ['updateAddress', 'removeAddress']
        });
        if (options.id != null && options.id.length > 0) {
            this.setData({
                'addressId': options.id
            })
            this.obtainAddressById(options.id);
        }
    },
    changeMode() {
        let that = this;
        DB.collection("state").where({
            json: 1
        }).get({
            success: (res) => {
                if (res.data.length == 1) {
                    this.setData({
                        'typess': 1
                    })
                }
                if (res.data.length == 2) {
                    this.setData({
                        'typess': 2
                    })
                }
            }
        })
    },
    async saveUpdateAddress() {
        let that = this;
        if (this.data.username == '' ||
            this.data.phone == '' ||
            this.data.region[2] == '' ||
            this.data.detailAddress == '') {
            wx.showModal({
                title: '提示',
                content: '信息录入不完整，注意每一项都为必填项，请检查后再提交',
                showCancel: false,
                confirmColor: '#497749'
            })
            return
        }
        wx.showModal({
            title: '温馨提示',
            content: '是否保存修改',
            confirmColor: '#497749',
            success: (res) => {
                if (res.confirm) {
                    if (that.data.default) {
                        DB.collection("address").where({
                            userId: app.globalData.userId
                        }).update({
                            data: {
                                flog: false
                            }
                        })
                    }
                    DB.collection("address").where({
                        _id: that.data.addressId
                    }).update({
                        data: {
                            username: that.data.username,
                            phone: that.data.phone,
                            easyAddress: that.data.region,
                            detailAddress: that.data.detailAddress,
                            flog: that.data.default
                        },
                        success: (res) => {
                            wx.showToast({
                                title: '保存修改成功',
                                duration: 1000,
                                success: (res) => {
                                    wx.navigateBack();
                                }
                            })
                        },
                        fail: (err) => {
                            wx.showToast({
                                title: '保存修改失败',
                                icon: 'error',
                                duration: 1000,
                            })
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });
    },
    async obtainAddressById(id) {
        const {
            data: res
        } = await DB.collection("address").where({
            _id: id
        }).get();
        this.setData({
            'flog': res[0].flog,
            'phone': res[0].phone,
            'region': res[0].easyAddress,
            'username': res[0].username,
            'default': res[0].flog,
            'detailAddress': res[0].detailAddress
        })
    },
    async pdAddress() {
        if (!this.data.flog) {
            const res = await DB.collection("address").where({
                userId: app.globalData.userId
            }).count();
            if (res.total == 0) {
                this.setData({
                    'default': true,
                    'k': true
                })
            }
        }
    },
    moveAddress() {
        let that = this;
        wx.showModal({
            title: '温馨提示',
            content: '确定要删除该地址吗?',
            confirmColor: '#497749',
            success(res) {
                if (res.confirm) {
                    DB.collection("address").where({
                        _id: that.data.addressId
                    }).remove({
                        success: (res) => {
                            wx.showToast({
                                title: '删除成功',
                                duration: 1000,
                                success: (res) => {
                                    that.removeAddress(that.data.addressId);
                                    wx.navigateBack();
                                }
                            })
                        },
                        fail: (err) => {
                            console.log(err);
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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
        this.storeBindings.destroyStoreBindings();
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