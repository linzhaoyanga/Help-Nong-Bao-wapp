const DB = wx.cloud.database();
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../share/index.js"
Page({
    data: {
        tabList: [

        ],
        isLoading: false,
        pageNum: 1,
        goods: [],
        pages: 0,
        isToast: false,
        flog: false,
        isHide: false
    },
    goSearch() {
        wx.navigateTo({
            url: '../../pakC/pages/search/search',
        })
    },
    goCart() {
        wx.navigateTo({
            url: '../../pakC/pages/cart/cart',
        })
    },
    goClassify(e) {
        if (e.currentTarget.dataset.index <= 8) {
            wx.navigateTo({
                url: '../../pakC/pages/sortList/sortList?type=' + e.currentTarget.dataset.index + '&text=' + this.data.tabList[e.currentTarget.dataset.index].text,
            })
        } else {
            wx.navigateTo({
                url: '../../pakC/pages/sort/sort',
            })
        }
    },
    gotolist(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../../pakC/pages/good/good?id=' + id,
        })
    },
    async obtainStoreTabs() {
        let ares = await DB.collection("tab").where({
            'type': "store-tab"
        }).limit(1).get();
        ares.data[0].tab.splice(9, ares.data[0].tab.length - 10);
        this.setData({
            'tabList': ares.data[0].tab
        })
    },
    //获取商品列表 根据类型加载对应得商品 默认第一页 每页10条\
    async obtainGoodsPage(pageNum = 1, num = 10) {
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            var total = 0;
            let res = await DB.collection('goods').where({
                state: 1,
            }).count();
            total = res.total;
            let add = total % num > 0 ? 1 : 0;
            let pages = parseInt(total / num) + add;
            this.setData({
                'pages': pages
            })
            let begin = (pageNum - 1) * num;
            let ares = await DB.collection("goods").where({
                state: 1
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
            businessId: obj.businessId,
            buyVolume: obj.buyVolume,
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
    onLoad(options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['num'],
            actions: ['updateNum', 'updateGoods']
        });
        this.changeMode();
        this.obtainStoreTabs();
        this.obtainGoodsPage();
    },
    changeMode() {
        const that = this;
        DB.collection("state").where({
            isHide: true
        }).get({
            success: (res) => {
                if (res.data.length == 1) {
                    that.setData({
                        'isHide': true
                    })
                }
            }
        });
    },
    onUnload() {
        this.storeBindings.destoryStoreBindings();
    },
    onReady() {},
    onShow: function () {
    },
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
    onShareTimeline(res) {
        return {
            title: "快来农产道吧！",
            path: '/pages/index/index',
            imageUrl: 'https://656e-env-8g3zj4v40ddceade-1312061176.tcb.qcloud.la/swiperImg/swiper-index-1.png?sign=f1d6e473c68d234b7e6d8af34253d242&t=1656601389',
            success: function (res) {
                console.log('分享成功')
            },
            fail: function (res) {
                console.log('分享失败')
            }
        }
    },
    onShareAppMessage(res) {
        return {
            title: "快来农产道吧！",
            path: '/pages/index/index',
            imageUrl: 'https://656e-env-8g3zj4v40ddceade-1312061176.tcb.qcloud.la/swiperImg/swiper-index-1.png?sign=f1d6e473c68d234b7e6d8af34253d242&t=1656601389',
            success: function (res) {
                console.log('分享成功')
            },
            fail: function (res) {
                console.log('分享失败')
            }
        }
    },
})