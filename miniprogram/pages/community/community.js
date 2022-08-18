// pages/community/community.js
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../share/index.js"
const app = getApp();
const DB = wx.cloud.database();
Page({
    data: {
        posts: [],
        isLoading: false,
        pageNum: 1,
        pages: 0,
        total: 0,
        rankings: [],
        flog: false,
        isToast: false,
        typess: '',
    },
    goSearch: function () {
        wx.navigateTo({
            url: '../../pakB/pages/search/search',
        })
    },
    goMessage() {
        wx.navigateTo({
            url: '../../pakB/pages/message/message',
        })
    },
    goPush() {
        if (this.data.user.userId != "") {
            wx.navigateTo({
                url: '../../pakB/pages/push/push',
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
    goPost(e) {
        wx.navigateTo({
            url: '../../pakB/pages/post/post?id=' + e.currentTarget.dataset.id,
        })
    },
    async obtainPushsPage(pageNum = 1, num = 4) {
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            var total = 0;
            let res = await DB.collection('posts').where({
                flog: true
            }).count();
            total = res.total;
            let add = total % num > 0 ? 1 : 0;
            let pages = parseInt(total / num) + add;
            this.setData({
                'total': total,
                'pages': pages
            })
            let begin = (pageNum - 1) * num;
            let {
                data: ares
            } = await DB.collection("posts").where({
                flog: true
            }).orderBy('time', 'desc').limit(num).skip(begin).get();
            let len = ares.length;
            for (let i = 0; i < len; i++) {
                let {
                    data: res
                } = await DB.collection("supportPost").field({
                    'flog': true
                }).where({
                    postId: ares[i]._id,
                    userId: app.globalData.userId,
                }).get();
                if (res[0]) {
                    ares[i].isSupport = res[0].flog;
                }
            }
            this.setData({
                'posts': [
                    ...this.data.posts,
                    ...ares
                ]
            })
            this.setData({
                'isLoading': false
            });
        }
        wx.stopPullDownRefresh();
    },
    async obtainRankingInfo() {
        let ares = await DB.collection("posts").field({
            context: true,
            supportVolume: true
        }).where({
            flog: true
        }).orderBy('supportVolume', 'desc').orderBy('commentVolume', 'desc').limit(3).get();
        this.setData({
            'rankings': [
                ...ares.data
            ]
        })
    },
    priviewImg(e) {
        const index = e.currentTarget.dataset.index;
        const i = e.currentTarget.dataset.i;
        wx.previewImage({
            current: this.data.posts[index].imgs[i],
            urls: [...this.data.posts[index].imgs],
        });
    },
    //点赞帖子
    async supportPost(e) {
        console.log(JSON.stringify(this.data.user));
        if (this.data.user && this.data.user.userId != "") {
            let id = e.currentTarget.dataset.id;
            let index = e.currentTarget.dataset.index;
            let num = this.data.posts[index].supportVolume;
            let context = this.data.posts[index].context;
            let cnum = this.data.posts[index].commentVolume;
            if (!this.data.posts[index].isSupport) {
                this.data.posts[index].isSupport = true;
                this.data.posts[index].supportVolume = num + 1;
                this.setData({
                    'posts': this.data.posts
                })
                num = num + 1;
            } else {
                this.data.posts[index].isSupport = false;
                this.data.posts[index].supportVolume = num - 1;
                this.setData({
                    'posts': this.data.posts
                })
                num = num - 1;
            }
            let isSupport = this.data.posts[index].isSupport;
            this.savePostSupportVolume(id, isSupport, context, num, cnum);
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
    async savePostSupportVolume(postId, isSupport, context, num, cnum) {
        const {
            data: res
        } = await DB.collection("supportPost").where({
            postId: postId,
            userId: app.globalData.userId,
        }).get();
        if (res.length == 0 && isSupport) {
            DB.collection("supportPost").add({
                data: {
                    postId: postId,
                    userId: app.globalData.userId,
                    username: app.globalData.username,
                    userimg: app.globalData.userimg,
                    context: context,
                    flog: isSupport,
                    supportVolume: num,
                    commentVolume: cnum,
                    time: +new Date(),
                    temp: 1
                }
            });
        } else {
            DB.collection("supportPost").where({
                postId: postId,
                userId: app.globalData.userId,
            }).update({
                data: {
                    flog: isSupport,
                    supportVolume: num,
                    commentVolume: cnum,
                    time: +new Date()
                }
            });
        }
        DB.collection("posts").where({
            _id: postId,
        }).update({
            data: {
                supportVolume: num,
            }
        });
    },
    async unshiftPostToposts() {
        if (this.data.postId && this.data.postId.length > 0) {
            let {
                data: res
            } = await DB.collection("posts").where({
                _id: this.data.postId
            }).get();
            this.data.posts.unshift(res[0]);
            this.setData({
                'posts': this.data.posts
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
    onLoad(options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['postId', 'user'],
            actions: ['updatePostId']
        });
        this.changeMode();
        this.obtainRankingInfo();
        this.obtainPushsPage();
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
            success(res) {
                console.log('showShareMenu', res);
            }
        })
    },
    onReady() {

    },
    onShow() {
        this.unshiftPostToposts();
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 1
            })
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        this.updatePostId('');
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
        this.setData({
            'isLoading': false,
            'pageNum': 1,
            'pages': 0,
            'posts': [],
            'rankings': [],
            'isToast': false
        });
        this.obtainRankingInfo();
        this.obtainPushsPage();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        if (this.data.pageNum < this.data.pages) {
            this.setData({
                'isToast': false,
                'pageNum': this.data.pageNum + 1
            })
            this.obtainPushsPage(this.data.pageNum);
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
        if (res.from == 'button') {
            let id = res.target.dataset.id;
            let index = res.target.dataset.index;
            let context = this.data.posts[index].context;
            let src = this.data.posts[index].imgs[0];
            let num = this.data.posts[index].shareVolume;
            return {
                title: context,
                path: '/pakB/pages/post/post?id=' + id,
                imageUrl: src,
                success: (ress) => {
                    console.log('分享成功')
                },
                fail: (fail) => {
                    console.log('分享失败')
                }
            }
        } else {
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
        }
    }
})