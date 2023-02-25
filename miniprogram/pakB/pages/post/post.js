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
        pageId: '',
        pageNum: 1,
        isLoading: false,
        isSupport: false,
        total: 0,
        pages: 0,
        flog: 0,
        postInfo: {},
        comments: [],
        commentContext: "",
        collectPost: {},
        isToast: false,
        supportVolume: 0,
        isComment: false,
        k: false,
        isPageLoading: false,
        isHide: app.globalData.isHide
    },
    onShareAppMessage() {
        wx.showShareMenu({
            withShareTicket: true,
            menu: ['shareAppMessage', 'shareTimeline']
        })
    },
    onShareTimeline() {
        return {
            title: this.data.postInfo.context,
            query: {
                id: this.data.pageId
            },
            imageUrl: this.data.postInfo.imgs[0]
        }
    },
    priviewImg(e) {
        const src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: [...this.data.postInfo.imgs],
        })
    },
    //根据页面参数获取文章相关信息
    async getpostInfo() {
        let {
            data: postInfo
        } = await DB.collection("posts").where({
            "_id": this.data.pageId
        }).get();
        this.setData({
            postInfo: postInfo[0]
        });
        this.collectPost();
    },
    //根据文章id获取评论分页信息
    async getCommentsInfo(pageNum = 1, num = 10) {
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            var total = 0;
            const res = await DB.collection('postComments').where({
                postId: this.data.pageId
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
            } = await DB.collection('postComments').where({
                postId: this.data.pageId
            }).orderBy("createTime", "desc").limit(num).skip(begin).get();
            let len = cos.length;
            for (let i = 0; i < len; i++) {
                let {
                    data: ress
                } = await DB.collection("postCollectComment").field({
                    flog: true,
                }).where({
                    commentId: cos[i]._id,
                    userId: app.globalData.userId,
                }).get();
                if (ress[0]) {
                    cos[i].isSupport = ress[0].flog;
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
    //点击按钮发送评论
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
                    postId: this.data.pageId,
                    userId: app.globalData.userId,
                    context: this.data.commentContext,
                    isSupport: false,
                    createTime: +new Date(),
                    supportVolume: 0,
                    userimg: app.globalData.userimg,
                    username: app.globalData.username,
                    postTitle: this.data.postInfo.context,
                };
                DB.collection("postComments").add({
                    data: obj,
                    success: (res) => {
                        wx.showToast({
                            title: "评论成功",
                            duration: 1000,
                            success: (ress) => {
                                this.data.postInfo.commentVolume = this.data.postInfo.commentVolume + 1;
                                this.setData({
                                    'postInfo': this.data.postInfo
                                })
                                DB.collection("posts").where({
                                    _id: this.data.pageId,
                                    flog: true
                                }).update({
                                    data: {
                                        commentVolume: this.data.postInfo.commentVolume,
                                    }
                                });

                                DB.collection("postCollectComment").add({
                                    data: {
                                        postId: this.data.pageId,
                                        context: this.data.postInfo.context,
                                        commentId: res._id,
                                        commentContext: this.data.commentContext,
                                        flog: false,
                                        temp: 1,
                                        createTime: +new Date(),
                                        time: +new Date(),
                                        userId: app.globalData.userId,
                                        userimg: app.globalData.userimg,
                                        username: app.globalData.username,
                                    },
                                });
                                this.data.comments.unshift(obj);
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
                } = await DB.collection("postCollectComment").field({}).where({
                    postId: that.data.pageId,
                    commentId: currentObj._id,
                    userId: app.globalData.userId,
                }).get();
                let flog = false;
                if (flogs.length == 0) {
                    DB.collection("postCollectComment").add({
                        data: {
                            postId: this.data.pageId,
                            context: this.data.postInfo.context,
                            commentId: currentObj._id,
                            commentContext: currentObj.context,
                            flog: false,
                            temp: 1,
                            createTime: +new Date(),
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
                DB.collection("postComments").where({
                    _id: currentObj._id
                }).update({
                    data: {
                        supportVolume: su,
                    },
                    success: (res) => {
                        DB.collection("postCollectComment").where({
                            postId: that.data.pageId,
                            userId: app.globalData.userId,
                            commentId: currentObj._id,
                        }).update({
                            data: {
                                flog: isSupport,
                                time: +new Date(),
                            },
                            success: (res) => {
                                this.setData({
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
    //收藏帖子
    async supportArtice() {
        if (this.data.user.userId != "") {
            if (!this.data.isSupport) {
                this.setData({
                    'isSupport': true,
                    'postInfo.supportVolume': this.data.postInfo.supportVolume + 1
                })
            } else {
                this.setData({
                    'isSupport': false,
                    'postInfo.supportVolume': this.data.postInfo.supportVolume - 1
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
    async collectPost() {
        const {
            data: obj
        } = await DB.collection("collectPost").where({
            postId: this.data.pageId,
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
        } = await DB.collection("collectPost").where({
            postId: this.data.pageId,
            userId: app.globalData.userId,
        }).get();
        if (res.length == 0 && this.data.isSupport) {
            DB.collection("collectPost").add({
                data: {
                    postId: this.data.pageId,
                    userId: app.globalData.userId,
                    username: app.globalData.username,
                    userimg: app.globalData.userimg,
                    postTitle: this.data.postInfo.context,
                    flog: this.data.isSupport,
                    time: +new Date(),
                    temp: 1
                }
            });
        } else {
            DB.collection("collectPost").where({
                postId: this.data.pageId,
                userId: app.globalData.userId,
            }).update({
                data: {
                    flog: this.data.isSupport,
                    time: +new Date()
                }
            });
        }
        DB.collection("posts").where({
            _id: this.data.postInfo._id,
            userId: this.data.postInfo.userId
        }).update({
            data: {
                supportVolume: this.data.postInfo.supportVolume,
            }
        });
    },
    onLoad: function (options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['user']
        });
        this.setData({
            pageId: options.id,
            flog: options.flog,
            isPageLoading: true
        });
        this.getpostInfo();
        this.collectPost();
        this.getCommentsInfo();
        setTimeout(() => {
            this.setData({
                'isPageLoading': false,
            })
        }, 200)
    },

    onReady: function () {

    },

    onShow: function () {

    },

    onHide: function () {

    },

    onUnload: function () {
        this.saveArticleSupportVolume();
    },

    onPullDownRefresh: function () {

    },

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

    onShareAppMessage: function () {

    }
})