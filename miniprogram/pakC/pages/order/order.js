// pages/order/order.js
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../../share/index"
const DB = wx.cloud.database();
const app = getApp();
Page({
    data: {
        openid: '',
        flog: false,
        portPrice: 0,
        totalPrice: 0,
        remarks: '',
        k: false,
        address: {

        },
        isBuy: false,
        buyGood: [],
        index: 0,
        array: ['请选择支付方式', '在线支付', '货到付款'],
        objectArray: [{
                id: 1,
                name: '请选择支付方式'
            }, {
                id: 2,
                name: '在线支付'
            },
            {
                id: 3,
                name: '货到付款'
            },
        ],
    },
    bindPickerChange(e) {
        this.setData({
            index: e.detail.value
        })
    },
    //地址
    address() {
        wx.redirectTo({
            url: '/pakD/pages/address/address?byorder=' + 1,
        })
    },
    async obtainAddress() {
        if (!this.data.k) {
            if (this.data.address.easyAddress[0].indexOf("甘肃") != -1 ||
                this.data.address.easyAddress[0].indexOf("西藏") != -1 ||
                this.data.address.easyAddress[0].indexOf("新疆") != -1 ||
                this.data.address.easyAddress[0].indexOf("内蒙古") != -1 ||
                this.data.address.easyAddress[0].indexOf("台湾") != -1) {
                this.setData({
                    'flog': true
                })
            }
            this.updateFlog(this.data.flog);
            this.setData({
                'portPrice': this.returnGoodsPortPrice(),
                'totalPrice': this.returnTotalPrice()
            })
        }

    },
    //生成订单 state 0 订单生成待付款 1 付款成功代发货 2 发货 3 运输中 4 派送中 5 收货完成 6 订单结束
    async submitOrder() {
        let that = this;
        if (JSON.stringify(this.data.address) == '{}') {
            wx.showToast({
                title: '未填写收货地址',
                icon: 'error',
                duration: 1000
            })
            return
        }
        if (this.data.index == 0) {
            wx.showToast({
                title: '请选择支付方式',
                icon: 'error',
                duration: 1000
            })
            return
        }
        let money = 0;
        let totalPrice = "";
        if (this.data.index == 1) {
            money = this.data.totalPrice;
        } else if (this.data.index == 2) {
            money = 0;
        }
        totalPrice = this.data.totalPrice;
        let obj = {
            goods: this.data.chooseGoods,
            goodsPrice: this.data.goodsPrice,
            portPrice: this.data.portPrice,
            totalPrice: this.data.totalPrice,
            goodsNum: this.data.choseNum,
            remarks: this.data.remarks,
            state: 0,
            payMoney: money,
            payType: this.data.index,
            createTime: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
            userId: app.globalData.userId,
            userimg: app.globalData.userimg,
            username: app.globalData.username,
            address: this.data.address,
            isExit: false,
            isExitGood: false,
            isExitMoney: false,
            isExitOrder: false,
            isExitG: false, //退货
            isExitM: false //退款
        };
        if (this.data.isBuy) {
            obj = this.data.buyGood[0];
            obj.remarks = this.data.remarks;
            obj.payType = this.data.index;
            obj.payMoney = money;
            totalPrice = this.data.buyGood[0].totalPrice;
        }
        DB.collection("order").add({
            data: obj,
            success: (res) => {
                wx.showModal({
                    title: '温馨提示',
                    content: '订单生成成功',
                    showCancel: false,
                    confirmColor: '#497749',
                    duration: 1000,
                    success: (res) => {
                        let len = obj.goods.length;
                        for (let i = 0; i < obj.goods.length; i++) {
                            DB.collection("com").where({
                                '_id': obj.goods[i].id
                            }).get({
                                success: (eess) => {
                                    DB.collection("com").where({
                                        '_id': obj.goods[i].id
                                    }).update({
                                        data: {
                                            'num': eess.data[0].num - obj.goods[i].num,
                                            'buyVolume': eess.data[0].buyVolume + 1
                                        }
                                    })
                                },
                                fail: (err) => {
                                    console.log(err);
                                }
                            });
                        }
                        this.removeChoseGoods();
                        wx.navigateTo({
                            url: '../pay/pay?type=' + this.data.index + "&money=" + totalPrice,
                        })
                    }
                });
            },
            fail: (err) => {
                console.log(err);
            }
        })

    },
    onReady() {},
    onLoad: function (options) {
        if (options.isBuy) {
            this.setData({
                'isBuy': JSON.parse(options.isBuy),
            });
        }
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['goodsPrice', 'choseNum', 'chooseGoods'],
            actions: ['beforeAction', 'updateFlog', 'returnGoodsPortPrice', 'returnTotalPrice', 'returnAddress', 'removeChoseGoods', 'updateSingleGood']
        });
        this.setData({
            'address': this.returnAddress()
        });
        if (!this.data.address.easyAddress) {
            this.setData({
                'k': true
            })
        }
        this.obtainAddress();
        if (this.data.isBuy) {
            let good = JSON.parse(wx.getStorageSync('singleGood'));
            let normalPostPrice = 0;
            if (this.data.flog) {
                if (good.remote) {
                    normalPostPrice = good.remote;
                }
                normalPostPrice = good.freight
            } else {
                normalPostPrice = good.freight
            }
            let obj = {
                goods: [{
                    flog: true,
                    id: good._id,
                    img: good.imgs[0],
                    normalPostPrice: normalPostPrice,
                    num: 1,
                    price: good.price,
                    title: good.title,
                    type: good.type,
                    businessId: good.businessId,
                    isSend: false,
                    sendTime: '',
                    sendId: '',
                    userIsUse: false,
                    isExit: false, //取消订单
                    isExitGood: false, //退货
                    isExitMoney: false, //退款
                    isExitG: false, //退货
                    isExitM: false //退款
                }],
                goodsPrice: Number(good.price).toFixed(2),
                portPrice: Number(normalPostPrice).toFixed(2),
                totalPrice: (Number(good.price) + Number(normalPostPrice)).toFixed(2),
                goodsNum: 1,
                remarks: this.data.remarks,
                state: 0,
                payMoney: 0,
                payType: 1,
                createTime: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                userId: app.globalData.userId,
                userimg: app.globalData.userimg,
                username: app.globalData.username,
                address: this.data.address,
                isExit: false,
                isExitGood: false,
                isExitMoney: false,
                isExitOrder: false
            }
            this.data.buyGood.push(obj)
            this.setData({
                'buyGood': this.data.buyGood
            })
        }
    },
    onShow() {},
    onHide() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        this.storeBindings.destroyStoreBindings();
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