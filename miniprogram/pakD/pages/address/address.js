// pages/address/address.js
const app = getApp();
const DB = wx.cloud.database();
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../../share/index"
Page({

    data: {
        address: [],
        isShow: false,
        byorder: '',
    },
    onLoad(options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['address','isCart'],
            actions: ['updateAddress']
        });
        this.getAddress();
        if (options.byorder) {
            this.setData({
                'byorder': options.byorder
            })
        }
    },
    chooseAddress(e) {
        let id = e.currentTarget.dataset.id;
        if (this.data.byorder == 1) {
            let index = this.data.address.findIndex((item) => item._id == id);
            this.updateAddress(this.data.address[index]);
            if(this.data.isCart == 0){
                wx.redirectTo({
                    url: '../../../pakC/pages/order/order?isBuy='+JSON.stringify(true),
                  });
            }else{
                wx.redirectTo({
                    url: '../../../pakC/pages/order/order',
                  });
            }
        }
    },
    updateAddresss(e) {
        wx.navigateTo({
            url: '../../pages/joinaddress/joinaddress?id=' + e.currentTarget.dataset.id,
        })
    },
    getAddress() {
        DB.collection("address").where({
            userId: app.globalData.userId
        }).get({
            success: (res) => {
                this.setData({
                    address: res.data
                })
                if (this.data.address.length == 0) {
                    this.setData({
                        'isShow': true
                    })
                }
            },
            fail: (err) => {
                console.log(err);
            }
        });
    },
    addaddress() {
        wx.navigateTo({
            url: '../../pages/joinaddress/joinaddress',
        })
    },
    deleteAddress(event) {
        const id = event.currentTarget.dataset.id;
        wx.showModal({
            title: '温馨提示',
            content: '是否确定删除',
            success: (res) => {
                if (res.confirm) {
                    DB.collection("address").where({
                        _id: id
                    }).remove({
                        success: (res) => {
                            wx.showToast({
                                title: '删除成功！',
                                duration: 1000,
                                success: (res) => {
                                    this.getAddress();
                                }
                            })
                        }
                    });
                } else if (res.cancel) {
                    console.log('用户点击取消');
                }
            }
        });
    },
    onReady() {

    },
    onShow() {
        this.getAddress();
    },
    onHide() {
        this.setData({
            'address': []
        })
    },
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