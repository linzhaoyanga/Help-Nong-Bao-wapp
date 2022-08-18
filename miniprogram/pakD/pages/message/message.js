const app = getApp()
const DB = wx.cloud.database();
Page({
    data: {
        userId: '',
        tyindex: 0,
        tablist: [{
                imgurl: '../../images/xiaoxi.png',
                name: '消息',
            },
            {
                imgurl: '../../images/shouc.png',
                name: '点赞',
            },
            {
                imgurl: '../../images/pingl.png',
                name: '评论',
            }
        ],
        xtInfo: [],
        supportCommentInfoByArticle: [],
        supportCommentInfoByPost: [],
        supportInfoByPost: [],
        commentInfoByPost: [],
        isLoading: false,
        emptyIndex: 0,
        flog: false
    },
    index(e) {
        this.setData({
            tyindex: e.currentTarget.dataset.index
        });
        if (this.data.tyindex == 0) {
            this.obtainXtInfo();
        } else if (this.data.tyindex == 1) {
            this.obtainsupportCommentInfoByArticle();
            this.obtainsupportCommentInfoByPost();
            this.obtainsupportInfoByPost();
        } else if (this.data.tyindex == 2) {
            this.obtainCommentInfoByPost();
        }
    },
    async obtainXtInfo() {
        const _ = DB.command;
        let noticeArr = JSON.parse(wx.getStorageSync('notice') || '[]');
        const {
            data: res
        } = await DB.collection("notice").where({
            '_id': _.nin(noticeArr),
        }).orderBy('time', 'asc').get();
        this.setData({
            'xtInfo': res
        })
        if (this.data.xtInfo.length == 0) {
            this.setData({
                'emptyIndex': this.data.tyindex,
                'flog': true
            })
        } else {
            this.setData({
                'emptyIndex': 0,
                'flog': false
            })
        }
    },
    async obtainsupportCommentInfoByArticle() {
        const _ = DB.command;
        let commentIds = [];
        let {
            data: ress
        } = await DB.collection("comments").where({
            _openid: app.globalData.openid,
        }).field({
            '_id': true
        }).get();
        ress.forEach((item) => {
            commentIds.push(item._id);
        })
        let {
            data: res
        } = await DB.collection("collectComment").where({
            commentId: _.in(commentIds),
            flog: true,
            temp: 1,
            userId: _.neq(this.data.userId)
        }).orderBy('time', 'desc').get();
        this.setData({
            'supportCommentInfoByArticle': res
        });
    },
    async obtainsupportCommentInfoByPost() {
        const _ = DB.command;
        let commentIds = [];
        let {
            data: ress
        } = await DB.collection("postComments").where({
            _openid: app.globalData.openid,
        }).field({
            '_id': true
        }).get();
        ress.forEach((item) => {
            commentIds.push(item._id);
        })
        let {
            data: res
        } = await DB.collection("postCollectComment").where({
            flog: true,
            temp: 1,
            commentId: _.in(commentIds),
            userId: _.neq(app.globalData.userId)
        }).orderBy('time', 'desc').get();
        this.setData({
            'supportCommentInfoByPost': res
        });
    },
    async obtainsupportInfoByPost() {
        const _ = DB.command;
        let postIds = [];
        let {
            data: ress
        } = await DB.collection("posts").where({
            _openid: app.globalData.openid,
            flog: true
        }).field({
            '_id': true
        }).get();
        ress.forEach((item) => {
            postIds.push(item._id);
        })
        let {
            data: res
        } = await DB.collection("supportPost").where({
            'postId': _.in(postIds),
            'flog': true,
            'temp': 1,
            'userId': _.neq(app.globalData.userId)
        }).orderBy('time', 'desc').get();
        this.setData({
            'supportInfoByPost': res
        });
       if(this.data.supportInfoByPost.length == 0 && this.data.supportCommentInfoByArticle.length == 0 && this.data.supportCommentInfoByPost.length == 0){
        this.setData({
            'emptyIndex': this.data.tyindex,
            'flog': true
        })
       }else{
        this.setData({
            'emptyIndex': 0,
            'flog': false
        })
       }
    },
    async obtainCommentInfoByPost() {
        const _ = DB.command;
        let postIds = [];
        let {
            data: ress
        } = await DB.collection("posts").where({
            _openid: app.globalData.openid,
        }).field({
            '_id': true
        }).get();
        ress.forEach((item) => {
            postIds.push(item._id);
        })
        let {
            data: res
        } = await DB.collection("postComments").where({
            postId: _.in(postIds),
            userId: _.neq(app.globalData.userId)
        }).orderBy('createTime', 'desc').get();
        this.setData({
            'commentInfoByPost': res
        });
        if (this.data.commentInfoByPost.length == 0) {
            this.setData({
                'emptyIndex': this.data.tyindex,
                'flog': true
            })
        } else {
            this.setData({
                'emptyIndex': 0,
                'flog': false
            })
        }
    },
    goArticle(e) {
        wx.navigateTo({
            url: '/pakA/pages/details/details?id=' + e.currentTarget.dataset.id,
        })
    },
    goPost(e) {
        wx.navigateTo({
            url: '../../../pakB/pages/post/post?id=' + e.currentTarget.dataset.id,
        })
    },
    deleteCollect(e) {
        let id = e.currentTarget.dataset.id;
        let name = e.currentTarget.dataset.name;
        let k = "";
        let index = 0;
        if (name == "supportPost") {
            k = "supportInfoByPost";
            index = this.data.supportInfoByPost.findIndex(item => item._id == id);
            this.data.supportInfoByPost.splice(index, 1);
            this.setData({
                supportInfoByPost: this.data.supportInfoByPost
            });
        } else if (name == "postCollectComment") {
            k = "supportCommentInfoByPost";
            index = this.data.supportCommentInfoByPost.findIndex(item => item._id == id);
            this.data.supportCommentInfoByPost.splice(index, 1);
            this.setData({
                supportCommentInfoByPost: this.data.supportCommentInfoByPost
            });
        } else if (name == "collectComment") {
            k = "supportCommentInfoByArticle";
            index = this.data.supportCommentInfoByArticle.findIndex(item => item._id == id);
            this.data.supportCommentInfoByArticle.splice(index, 1);
            this.setData({
                supportCommentInfoByArticle: this.data.supportCommentInfoByArticle
            });
        };
        DB.collection(name).where({
            '_id': id
        }).update({
            data: {
                temp: 0
            },
            success: (res) => {
                console.log(res);
                console.log("ok");
            }
        })
    },
    deleteComment(e) {
        let id = e.currentTarget.dataset.id;
        let index = this.data.commentInfoByPost.findIndex((item) => {
            return item._id = id
        });
        this.data.commentInfoByPost.splice(index, 1);
        this.setData({
            'commentInfoByPost': this.data.commentInfoByPost
        });
        DB.collection("postComments").where({
            '_id': id
        }).update({
            data: {
                temp: 0
            },
            success: (res) => {
                console.log("ok");
            }
        })
    },
    deleteXtNotice(e) {
        let noticeArr = JSON.parse(wx.getStorageSync('notice') || '[]');
        let id = e.currentTarget.dataset.id;
        let index = this.data.xtInfo.findIndex((item) => {
            return item._id = id
        });
        noticeArr.push(id);
        this.data.xtInfo.splice(index, 1);
        this.setData({
            'xtInfo': this.data.xtInfo
        });
        wx.setStorageSync("notice", JSON.stringify(noticeArr));
    },
    goXt(e) {
        wx.navigateTo({
            url: '../../pages/pubdatails/pubdatails?obj=' + JSON.stringify(e.currentTarget.dataset.obj),
        })
    },

    onLoad: function (options) {
        this.setData({
            'userId': app.globalData.userId
        });
        this.obtainXtInfo();
    },
    onReady: function () {

    }

})