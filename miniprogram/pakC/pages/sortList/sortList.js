// pakC/pages/sortList/sortList.js
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../../share/index"
const DB = wx.cloud.database();
Page({
    data: {
        type: '',
        isLoading: false,
        pageNum: 1,
        goods: [],
        pages: 0,
        isToast: false,
        flog: false,
        typess:'',
    },
    gotolist(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../good/good?id=' + id,
        })
    },
    async obtainGoodsPage(pageNum = 1, num = 10) {
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            var total = 0;
            let res = await DB.collection('com').where({
                state: 1,
                goodType: this.data.type,
            }).count();
            total = res.total;
            let add = total % num > 0 ? 1 : 0;
            let pages = parseInt(total / num) + add;
            this.setData({
                'pages': pages
            })
            let begin = (pageNum - 1) * num;
            let ares = await DB.collection("com").where({
                state: 1,
                goodType: this.data.type,
            }).limit(num).skip(begin).get();
            this.setData({
                'goods': [
                    ...this.data.goods,
                    ...ares.data
                ]
            })
            if (this.data.goods.length == 0) {
                this.setData({
                    'flog': true
                })
            }
            this.setData({
                'isLoading': false
            });
        }
    },
    joinCart(e) {
        let index = e.currentTarget.dataset.index;
        let obj = this.data.goods[index];
        if (obj.num == 0) {
            wx.showToast({
                icon: 'error',
                title: '库存为0',
                duration: 1000
            });
            return
        }
        this.updateGoods({
            id: obj._id,
            businessId: obj.businessId,
            img: obj.imgs[0],
            title: obj.title,
            total: obj.num,
            num: 1,
            type: obj.type,
            price: obj.price,
            normalPostPrice: obj.freight,
            remotePostPrice: obj.remote,
            flog: true,
            buyVolume: obj.buyVolume,
            isSend:false,
            sendTime:'',
            sendId:'',
            userIsUse:false,
            isExit:false,
            isExitGood:false,
            isExitMoney:false
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['num'],
            actions: ['updateNum', 'updateGoods']
        });
        this.changeMode();
        this.setData({
            'type': Number(options.type)
        });
        wx.setNavigationBarTitle({
            title: options.text,
        })
        this.obtainGoodsPage();
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
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

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
        this.storeBindings.destoryStoreBindings();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.pageNum < this.data.pages) {
            this.setData({
                'isToast': false,
                'pageNum': this.data.pageNum + 1
            })
            this.obtainGoodsPage(this.data.pageNum);

        } else {
            this.setData({
                'isToast': true
            })
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})