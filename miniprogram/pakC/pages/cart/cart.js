// pakA/pages/cart/cart.js
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../../share/index"
const DB = wx.cloud.database();
Page({
    data: {
        goodsPrice: 0,
        goodList: []
    },
    onLoad: function (options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['goodsPrice', 'choseNum', 'user'],
            actions: ['beforeAction', 'returnGoods', 'updateIsCart']
        });
        this.setData({
            'goodList': this.returnGoods()
        });
    },
    addNum(e) {
        let id = e.currentTarget.dataset.id;
        let index = this.data.goodList.findIndex((item) => {
            return item.id == id
        });
        let total = this.data.goodList[index].total;
        let num = this.data.goodList[index].num;
        if (index != -1 && (num < total)) {
            this.data.goodList[index].num = this.data.goodList[index].num + 1;
            this.setData({
                'goodList': this.data.goodList
            })
            this.beforeAction(this.data.goodList);
        } else {
            wx.showToast({
                icon: 'error',
                title: '库存不足',
                duration: 1000,
            });
        }
    },
    reduceNum(e) {
        let id = e.currentTarget.dataset.id;
        let index = this.data.goodList.findIndex((item) => {
            return item.id == id
        });
        let total = this.data.goodList[index].total;
        let num = this.data.goodList[index].num;
        if (index != -1 && num > 1) {
            this.data.goodList[index].num = this.data.goodList[index].num - 1;
            this.setData({
                'goodList': this.data.goodList
            })
            this.beforeAction(this.data.goodList);
        }
    },
    removeGood(e) {
        let id = e.currentTarget.dataset.id;
        let index = this.data.goodList.findIndex((item) => {
            return item.id == id
        });
        if (index != -1) {
            this.data.goodList.splice(index, 1);
            this.setData({
                'goodList': this.data.goodList
            })
            this.beforeAction(this.data.goodList);
        }
    },
    //切换选择
    toggleChoose(e) {
        let id = e.currentTarget.dataset.id;
        let index = this.data.goodList.findIndex((item) => {
            return item.id == id
        });
        if (index != -1) {
            this.data.goodList[index].flog = !this.data.goodList[index].flog;
            this.setData({
                'goodList': this.data.goodList
            })
            this.beforeAction(this.data.goodList);
        }
    },
    returnStore() {
        wx.switchTab({
            url: '../../../pages/store/store',
        })
    },
    //选择取消
    exitAll(e) {
        this.data.goodList.forEach((item) => {
            if (item.flog) {
                item.flog = false
            }
        });
        this.setData({
            'goodList': this.data.goodList
        });
        this.beforeAction(this.data.goodList);
    },
    goOrder(e) {
        if (this.data.user.userId != "") {
            let flog = e.currentTarget.dataset.flog;
            if (flog <= 0)
                return
            this.updateIsCart(1);
            wx.navigateTo({
                url: '../order/order',
            })
        } else {
            wx.showModal({
                title: '温馨提示',
                content: '你还没有登录，暂时不能进行该操作，请前往我的页面进行登录',
                showCancel: false,
                confirmColor: '#497749',
                duration: 1000
            });
        }

    },
    goGood(e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../../pages/good/good?id=' + id
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
    onShow: function () {},

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

    },

})