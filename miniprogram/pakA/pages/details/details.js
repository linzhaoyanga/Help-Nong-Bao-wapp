const app = getApp()
const WxParse = require('../../wxParse/wxParse.js');
const DB = wx.cloud.database();
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../../share/index"
Page({
    data: {
        pageId: '',
        pageNum: 1,
        isLoading: false,
        isSupport: false,
        total: 0,
        flog: 0,
        pages: 0,
        articleInfo: {},
        comments: [],
        commentContext: "",
        collectArticle: {},
        isToast: false,
        supportVolume: 0,
        isComment: false,
        k: false,
        isPageLoading: false,
        readArticleIds: [],
        isHide: app.globalData.isHide
    },
   
    //根据页面参数获取文章相关信息
    async getArticleInfo() {
        let {
            data: articleInfo
        } = await DB.collection("article").where({
            "_id": this.data.pageId
        }).get();
        this.setData({
            articleInfo: articleInfo[0]
        });
        WxParse.wxParse('article', 'html', this.data.articleInfo.context, this, 5);
        this.collectArticle();
    },
    //根据文章id获取评论分页信息
    async getCommentsInfo(pageNum = 1, num = 10) {
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            var total = 0;
            const res = await DB.collection('comments').where({
                articleId: this.data.pageId
            }).count();
            total = res.total;
            if (total <= 0) return
            let add = total % num > 0 ? 1 : 0;
            let pages = parseInt(total / num) + add;
            this.setData({
                total: total,
                pages: pages
            });
            let begin = (pageNum - 1) * num;
            const {
                data: cos
            } = await DB.collection('comments').where({
                articleId: this.data.pageId
            }).orderBy("supportVolume", "desc").limit(num).skip(begin).get();
            let len = cos.length;
            for (let i = 0; i < len; i++) {
                let {
                    data: res
                } = await DB.collection("collectComment").field({
                    flog: true,
                }).where({
                    commentId: cos[i]._id,
                    userId: app.globalData.userId,
                }).get();
                if (res[0]) {
                    cos[i].isSupport = res[0].flog;
                }
            }
            this.setData({
                'comments': [...this.data.comments, ...cos]
            });
            this.setData({
                'isLoading': false
            });
        }
    },
    async sendMessage() {
        if (this.data.user.userId != "") {
            if (this.data.commentContext == "") return
            let check = await app.checkContext(this.data.commentContext,2);
            if(!check){
                wx.showModal({
                    title: '温馨提示',
                    content: '评论内容不合法，请重新输入！',
                    showCancel: false,
                    confirmColor: '#497749',
                    duration: 1000,
                    complete:()=>{
                        this.setData({
                            'commentContext':''
                        })
                    }
                })
                return
            }
            if (!this.data.isComment) {
                this.setData({
                    'isComment': true
                });
                let obj = {
                    articleId: this.data.pageId,
                    userId: app.globalData.userId,
                    context: this.data.commentContext,
                    isSupport: false,
                    createTime: app.formatDate(new Date()),
                    supportVolume: 0,
                    userimg: app.globalData.userimg,
                    username: app.globalData.username,
                    articleTitle: this.data.articleInfo.title,
                }
                DB.collection("comments").add({
                    data: obj,
                    success: (res) => {
                        wx.showToast({
                            title: "评论成功",
                            duration: 1000,
                            success: (ress) => {
                                DB.collection("collectComment").add({
                                    data: {
                                        articleId: this.data.pageId,
                                        articleTitle: this.data.articleInfo.title,
                                        commentId: res._id,
                                        commentContext: this.data.commentContext,
                                        flog: false,
                                        temp: 1,
                                        supportVolume: 0,
                                        createTime: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                                        time: +new Date(),
                                        userId: app.globalData.userId,
                                        userimg: app.globalData.userimg,
                                        username: app.globalData.username,
                                    },
                                });
                                this.data.comments.unshift(obj)
                                this.setData({
                                    'commentContext': "",
                                    'comments': this.data.comments,
                                    'total': this.data.total + 1
                                });
                            }
                        })
                    },
                    fail: (err) => {
                        wx.showToast({
                            title: '评论失败',
                            duration: 2000,
                        });
                    }
                });
                this.setData({
                    'isComment': false
                });
            }
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
    //点赞评论
    async supportComment(event) {
        if (this.data.user.userId != "") {
            if (!this.data.k) {
                this.setData({
                    'k': true
                });
                let id = event.currentTarget.dataset.id;
                let that = this;
                let index = this.data.comments.findIndex((item) => item._id == id);
                let currentObj = this.data.comments[index];
                let isSupport = false;
                let su = 0;
                let {
                    data: flogs
                } = await DB.collection("collectComment").field({
                    flog: true
                }).where({
                    articleId: that.data.pageId,
                    commentId: currentObj._id,
                    userId: app.globalData.userId,
                }).get();
                let flog = false;
                if (flogs.length == 0) {
                    DB.collection("collectComment").add({
                        data: {
                            articleId: this.data.pageId,
                            articleTitle: this.data.articleInfo.title,
                            commentId: currentObj._id,
                            commentContext: currentObj.context,
                            flog: false,
                            temp: 1,
                            supportVolume: 0,
                            createTime: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                            time: +new Date(),
                            userId: app.globalData.userId,
                            userimg: app.globalData.userimg,
                            username: app.globalData.username,
                        },
                    });
                    flog = false;
                } else {
                    flog = flogs[0].flog;
                }
                if (flog) {
                    su = currentObj.supportVolume - 1;
                    this.data.comments[index].supportVolume = su;
                    this.data.comments[index].isSupport = false;
                    that.setData({
                        'comments': that.data.comments
                    });
                    isSupport = false;
                } else if (!flog) {
                    su = currentObj.supportVolume + 1;
                    this.data.comments[index].supportVolume = su;
                    this.data.comments[index].isSupport = true;
                    that.setData({
                        'comments': that.data.comments
                    });
                    isSupport = true;
                }
                DB.collection("comments").where({
                    _id: currentObj._id
                }).update({
                    data: {
                        supportVolume: su,
                    },
                    success: (res) => {
                        DB.collection("collectComment").where({
                            articleId: currentObj.articleId,
                            userId: app.globalData.userId,
                            commentId: currentObj._id
                        }).update({
                            data: {
                                flog: isSupport,
                                supportVolume: su,
                                time: +new Date(),
                            },
                            success: (ress) => {
                                that.setData({
                                    'k': false
                                });
                            }
                        });
                    },
                });
            }
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
    //点赞文章
    async supportArtice() {
        if (this.data.user.userId != "") {
            if (!this.data.isSupport) {
                this.setData({
                    'isSupport': true,
                    'articleInfo.supportVolume': this.data.articleInfo.supportVolume + 1
                })
            } else {
                this.setData({
                    'isSupport': false,
                    'articleInfo.supportVolume': this.data.articleInfo.supportVolume - 1
                })
            }
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
    //收藏文章
    async collectArticle() {
        const {
            data: obj
        } = await DB.collection("collectArticle").where({
            articleId: this.data.pageId,
            userId: app.globalData.userId,
        }).get();
        if (obj.length > 0 && obj[0].flog) {
            this.setData({
                'isSupport': true,
            });
        } else if ((obj.length > 0 && !obj[0].flog) || obj.length == 0) {
            this.setData({
                'isSupport': false,
            });
        }
    },
    async saveArticleSupportVolume() {
        const {
            data: res
        } = await DB.collection("collectArticle").where({
            articleId: this.data.pageId,
            userId: app.globalData.userId,
        }).get();
        if (res.length == 0 && this.data.isSupport) {
            DB.collection("collectArticle").add({
                data: {
                    articleId: this.data.pageId,
                    userId: app.globalData.userId,
                    username: app.globalData.username,
                    userimg: app.globalData.userimg,
                    articleTitle: this.data.articleInfo.title,
                    flog: this.data.isSupport,
                    time: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                    temp: 1
                }
            });
        } else {
            DB.collection("collectArticle").where({
                articleId: this.data.pageId,
                userId: app.globalData.userId,
            }).update({
                data: {
                    flog: this.data.isSupport,
                    time: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
                }
            });
        }
        DB.collection("article").where({
            _id: this.data.articleInfo._id,
            _openid: this.data.articleInfo._openid
        }).update({
            data: {
                supportVolume: this.data.articleInfo.supportVolume,
            }
        });
    },
    // 增加阅读量
    addArticleReadVolume() {
        if (this.data.user.userId != "") {
            let num = this.data.articleInfo.readVolume == null ? 1 : this.data.articleInfo.readVolume + 1;
            DB.collection("article").where({
                _id: this.data.articleInfo._id,
                _openid: this.data.articleInfo._openid
            }).update({
                data: {
                    readVolume: num,
                },
                success: (res) => {
                    console.log(res);
                }
            });
        }
    },
    onLoad: function (options) {
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
            success(res) {
                console.log('showShareMenu', res);
            }
        })
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['user']
        });
        this.setData({
            isPageLoading: true,
            pageId: options.id,
            flog: options.flog
        });
        this.getArticleInfo();
        this.collectArticle();
        this.getCommentsInfo();
        setTimeout(() => {
            this.setData({
                'isPageLoading': false
            })
        }, 400);
        this.setData({
            'readArticleIds': JSON.parse(wx.getStorageSync('readArticleIds') || '[]')
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
        this.saveArticleSupportVolume();
        let index = this.data.readArticleIds.findIndex((item) => item == this.data.articleInfo._id);
        if (index == -1) {
            this.data.readArticleIds.push(this.data.articleInfo._id);
            this.setData({
                'readArticleIds': this.data.readArticleIds
            })
            wx.setStorageSync('readArticleIds', JSON.stringify(this.data.readArticleIds));
            this.addArticleReadVolume();
        }
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
        if (this.data.total == 0)
            return;
        if (this.data.pageNum < this.data.pages) {
            this.setData({
                'isToast': false,
                'pageNum': this.data.pageNum + 1
            });
            this.getCommentsInfo(this.data.pageNum);
        } else {
            this.setData({
                'isToast': true
            })
        }
    },
    onShareAppMessage() {
        wx.showShareMenu({
            withShareTicket: true,
            menu: ['shareAppMessage', 'shareTimeline']
        })
    },
    onShareTimeline(res) {
        return {
            title: this.data.articleInfo.title,
            query: {
                id: this.data.pageId
            },
            imageUrl: this.data.articleInfo.coverPic
        }
    },
    onShareAppMessage(res) {
        return {
            title: this.data.articleInfo.title,
            query: {
                id: this.data.pageId
            },
            imageUrl: this.data.articleInfo.coverPic
        }
    },
})