import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../../share/index"
const DB = wx.cloud.database();
Page({
    data: {
        goodId: '',
        goodInfo: {},
        types: [
            '蔬菜',
            '水果',
            '粮油',
            '花卉',
            '茶叶',
            '兽药',
            '饲料',
            '农药',
            '种子',
            '农机',
            '渔业'
        ],
        isPageLoading: false
    },
    goOrder() {
        var id = this.data.id;
        wx.navigateTo({
            url: '../order/order?id=' + id,
        })
    },
    goCart() {
        wx.navigateTo({
            url: '../../pages/cart/cart',
        })
    },
    goStore() {
        wx.switchTab({
            url: '../../../pages/store/store',
        });
    },
    async obtainGoodInfo() {
        const {
            data: res
        } = await DB.collection("goods").where({
            _id: this.data.goodId
        }).get();
        this.setData({
            'goodInfo': res[0]
        });
    },
    onLoad(e) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['num','user'],
            actions: ['updateGoods','updateSingleGood','updateIsCart']
        });
        this.setData({
            goodId: e.id,
            isPageLoading: true,
        });
        this.obtainGoodInfo();
        wx.showShareMenu({
            withShareTicket: true,
            menu: ['shareAppMessage', 'shareTimeline']
        });
        setTimeout(() => {
            this.setData({
                'isPageLoading': false
            })
        }, 1000)
    },
    joinCart() {
        if (this.data.goodInfo.num == 0) {
            wx.showToast({
                icon: 'error',
                title: '库存为0',
                duration: 1000
            });
            return
        }
        this.updateGoods({
            id: this.data.goodInfo._id,
            businessId: this.data.goodInfo.businessId,
            img: this.data.goodInfo.imgs[0],
            title: this.data.goodInfo.title,
            total: this.data.goodInfo.num,
            num: 1,
            type: this.data.goodInfo.type,
            price: this.data.goodInfo.price,
            normalPostPrice: this.data.goodInfo.freight,
            remotePostPrice: this.data.goodInfo.remote,
            flog: true,
            isSend:false,
            sendTime:'',
            sendId:'',
            userIsUse:false,
            isExit:false,
            isExitGood:false,
            isExitMoney:false
        });
    },
    async goBuy() {
        if (this.data.user.userId != "") {
            const {
                data: res
            } = await DB.collection("goods").field({
                'num': true
            }).where({
                _id: this.data.goodId
            }).get();
            if (res[0].num == 0) {
                wx.showToast({
                    title: '库存为0',
                    icon: 'error',
                    duration: 1000
                })
                return
            }
            let good = this.data.goodInfo;
            good.num = 1;
            this.updateSingleGood(good)
            this.updateIsCart(0);
            wx.navigateTo({
                url: '../../pages/order/order?isBuy='+JSON.stringify(true),
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
    priviewImg(e) {
        const index = e.currentTarget.dataset.index;
        wx.previewImage({
            current: this.data.goodInfo.imgs[index],
            urls: this.data.goodInfo.imgs,
        });
    },
    onShareAppMessage: function () {
        return {
            title: this.data.goodInfo.title,
            path: '/pakC/pages/good/good?id=' + this.data.goodId,
            imageUrl: this.data.goodInfo.imgs[0],
            success: function (res) {
                console.log('分享成功')
            },
            fail: function (res) {
                console.log('分享失败')
            }
        }
    },
    onShareTimeline: function () {
        return {
            title: this.data.goodInfo.title,
            path: '/pakC/pages/good/good?id=' + this.data.goodId,
            imageUrl: this.data.goodInfo.imgs[0],
            success: function (res) {
                console.log('分享成功')
            },
            fail: function (res) {
                console.log('分享失败')
            }
        }
    },
    onReady() {

    },

    onShow() {

    },

    onHide() {

    },

    onUnload() {

    },

    onPullDownRefresh() {

    },
    onReachBottom() {

    },
  
})