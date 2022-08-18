// pages/my/my.js
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../share/index.js"
const app = getApp()
const DB = wx.cloud.database();
Page({
    data: {
        head_img_url: "",
        nickname: "",
        aaa: false,
        isPushArticle: false,
        isMerchant: false,
        isLogin: false,
        typess: ''
    },
    golike() {
        wx.navigateTo({
            url: '../../pakD/pages/like/like',
        })
    },
    a() {
        wx.navigateTo({
            url: '/pakD/pages/message/message',
        })
    },
    b() {
        wx.navigateTo({
            url: '/pakD/pages/note/note',
        })
    },
    goCollect() {
        wx.navigateTo({
            url: '/pakD/pages/collect/collect',
        })
    },
    godingdan() {
        wx.navigateTo({
            url: '/pakD/pages/allorder/allorder',
        })
    },
    aaaoder(e) {
        wx.navigateTo({
            url: '/pakD/pages/allorder/allorder?id=' + e.currentTarget.dataset.id,
        })
    },
    getUserProfile() {
        if (this.data.user.userId == "") {
            var openid = app.globalData.openid;
            DB.collection("useres").where({
                _openid: openid
            }).get({
                success: (res) => {
                    if (res.data.length == 0) {
                        wx.showModal({
                            title: '温馨提示',
                            content: '您第一次登录是否授权用户信息',
                            success: (res) => {
                                if (res.confirm) {
                                    wx.getUserProfile({
                                        desc: '展示用户信息',
                                        success: (ress) => {
                                            this.isMerchant(openid)
                                            this.setData({
                                                head_img_url: ress.userInfo.avatarUrl,
                                                nickname: ress.userInfo.nickName
                                            });
                                            DB.collection("useres").add({
                                                data: {
                                                    userimg: ress.userInfo.avatarUrl,
                                                    username: ress.userInfo.nickName,
                                                    flog: false
                                                },
                                                success: (resss) => {
                                                    this.isMerchant(openid);
                                                    this.updateUser({
                                                        openid: openid,
                                                        userId: resss._id,
                                                        userimg: ress.userInfo.avatarUrl,
                                                        username: ress.userInfo.nickName,
                                                        isMerchant: this.data.isMerchant,
                                                        typess: this.data.typess
                                                    });
                                                    app.updateGlobalData({
                                                        openid: openid,
                                                        userId: resss._id,
                                                        userimg: ress.userInfo.avatarUrl,
                                                        username: ress.userInfo.nickName,
                                                        isMerchant: this.data.isMerchant,
                                                        typess: this.data.typess
                                                    });
                                                    this.setData({
                                                        'isLogin': true
                                                    })
                                                },
                                            })
                                        },
                                        fail: (fail) => {
                                            this.updateUser({
                                                userId: "",
                                                openid: openid,
                                                username: "",
                                                userimg: "",
                                                flog: "",
                                                isMerchant: "",
                                                typess: ""
                                            });
                                        }
                                    })
                                } else {
                                    this.updateUser({
                                        userId: "",
                                        openid: openid,
                                        username: "",
                                        userimg: "",
                                        flog: "",
                                        isMerchant: "",
                                        typess: ""
                                    });
                                }
                            },
                            fail: (fail) => {
                                this.updateUser({
                                    userId: "",
                                    openid: openid,
                                    username: "",
                                    userimg: "",
                                    flog: "",
                                    isMerchant: "",
                                    typess: ""
                                });
                            }
                        });
                    } else {
                        this.setData({
                            head_img_url: res.data[0].userimg,
                            nickname: res.data[0].username,
                            isPushArticle: res.data[0].flog
                        });
                        this.isMerchant(openid)
                        this.updateUser({
                            openid: res.data[0]._openid,
                            userId: res.data[0]._id,
                            userimg: res.data[0].userimg,
                            username: res.data[0].username,
                            isMerchant: this.data.isMerchant,
                            typess: this.data.typess
                        });
                        app.updateGlobalData({
                            openid: res.data[0]._openid,
                            userId: res.data[0]._id,
                            userimg: res.data[0].userimg,
                            username: res.data[0].username,
                            isMerchant: this.data.isMerchant,
                            typess: this.data.typess
                        });
                        this.setData({
                            'isLogin': true
                        })
                    }
                },
            })
        }
    },
    manager() {
        if (app.globalData.flog) {
            this.setData({
                'isPushArticle': true
            })
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
    isMerchant(openid) {
        DB.collection("merchantSettlement").where({
            _openid: openid,
            state: 3
        }).get({
            success: (res) => {
                if (res.data[0].state == 3) {
                    this.setData({
                        isMerchant: true
                    })
                }
            }
        })
    },
    onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['user'],
            actions: ['updateUser', 'returnUser']
        });
        this.changeMode();
        if (this.returnUser().userId && this.returnUser().userId != "") {
            this.setData({
                head_img_url: app.globalData.userimg,
                nickname: app.globalData.username,
                isMerchant: app.globalData.isMerchant,
                aaa: true,
                isLogin: true
            })
            this.manager();
        }
    },
    address() {
        wx.navigateTo({
            url: "../../pakD/pages/address/address"
        });
    },
    regard() {
        wx.navigateTo({
            url: '../../pakD/pages/regard/regard',
        })
    },
    article() {
        wx.navigateTo({
            url: '../../pakA/pages/article/article',
        })
    },
    openSetting() {
        wx.openSetting();
    },
    //成为商家
    merchant() {
        wx.navigateTo({
            url: '../../pakD/pages/call/call',
        })
    },
    //发布商品
    publish() {
        wx.navigateTo({
            url: '../../pakD/pages/switch/switch',
        })
    },
    //商品订单
    productOrder() {
        wx.navigateTo({
            url: '../../pakD/pages/orderfrom/orderfrom',
        })
    },
    goMyGoods() {
        wx.navigateTo({
            url: '../../pakD/pages/mycommodity/mycommodity',
        })
    },
    onReady() {

    },
    onShow: function () {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 3
            })
        }
    },
    onHide() {

    },
    onUnload() {

    },

    onPullDownRefresh() {

    },

    onReachBottom() {

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