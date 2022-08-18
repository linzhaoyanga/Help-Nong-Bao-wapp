// pakA/pages/collect/collect.js
//创建数据库连接
const app = getApp()
const DB = wx.cloud.database();
Page({

    data: {
        tab: ["文章", "帖子"],
        articleList: [],
        postList: [],
        tabIndex: 0,
        isLoading: false,
        pageNum: 1,
        pages: 0,
        total: 0,
        flog: false,
        isToast: false
    },
    changeTab(e) {
        this.setData({
            'tabIndex': e.currentTarget.dataset.index
        });
        this.setData({
            articleList: [],
            postList: [],
            isLoading: false,
            pageNum: 1,
            pages: 0,
            total: 0,
            flog: false,
            isToast: false
        });
        if(this.data.tabIndex == 0){
            this.ontainCollectArticlePage();
        
        }else if(this.data.tabIndex == 1){
            this.obtainCollectPostsPage();
        }
    },
    goArticle(e) {
        wx.navigateTo({
            url: '../../../pakA/pages/details/details?id=' + e.currentTarget.dataset.id,
        })
    },
    goPost(e) {
        wx.navigateTo({
            url: '../../../pakB/pages/post/post?id=' + e.currentTarget.dataset.id,
        })
    },
    exitCollectPost(e) {
        let id = e.currentTarget.dataset.id;
        let index = e.currentTarget.dataset.index;
        let that = this;
        wx.showModal({
            title: '温馨提示',
            content: '确定取消收藏该帖子吗',
            confirmColor: '#497749',
            duration: 1000,
            success: (res) => {
                if (res.confirm) {
                    that.data.postList.splice(index, 1);
                    that.setData({
                        postList: that.data.postList
                    });
                    DB.collection("collectPost").where({
                        postId: id,
                        userId: app.globalData.userId
                    }).update({
                        data: {
                            flog: false
                        },
                        success: (res) => {
                            console.log(res);
                            wx.showToast({
                                title: '取消收藏成功',
                                duration: 500
                            })
                        },
                        fali: (err) => {
                            console.log(err);
                        }
                    });
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    exitCollectArticle(e){
        let id = e.currentTarget.dataset.id;
        let index = e.currentTarget.dataset.index;
        let that = this;
        wx.showModal({
            title: '温馨提示',
            content: '确定取消收藏该文章吗',
            confirmColor: '#497749',
            duration: 1000,
            success: (res) => {
                if (res.confirm) {
                    that.data.articleList.splice(index, 1);
                    that.setData({
                        articleList: that.data.articleList
                    });
                    DB.collection("collectArticle").where({
                        articleId: id,
                        userId: app.globalData.userId
                    }).update({
                        data: {
                            flog: false
                        },
                        success: (res) => {
                            wx.showToast({
                                title: '取消收藏成功',
                                duration: 500
                            })
                        },
                        fali: (err) => {
                            console.log(err);
                        }
                    });
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    async ontainCollectArticlePage(pageNum = 1, num = 5) {
        let ids = [];
        const _ = DB.command;
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            var total = 0;
            let res = await DB.collection('collectArticle').where({
                flog: true,
                _openid: app.globalData.openid
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
            } = await DB.collection("collectArticle").where({
                flog: true,
                _openid: app.globalData.openid
            }).field({
                'articleId': true
            }).orderBy('time', 'desc').limit(num).skip(begin).get();
            ares.forEach((item) => {
                ids.push(item.articleId);
            })
            let {
                data: aress
            } = await DB.collection("article").where({
                _id: _.in(ids)
            }).get();
            this.setData({
                'articleList': [
                    ...this.data.articleList,
                    ...aress
                ]
            })
            this.setData({
                'isLoading': false
            });
        }
        wx.stopPullDownRefresh();
    },
    async obtainCollectPostsPage(pageNum = 1, num = 6) {
        let ids = [];
        const _ = DB.command;
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            var total = 0;
            let res = await DB.collection('collectPost').where({
                flog: true,
                _openid: app.globalData.openid
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
            } = await DB.collection("collectPost").where({
                flog: true,
                _openid: app.globalData.openid
            }).field({
                'postId': true
            }).orderBy('time', 'desc').limit(num).skip(begin).get();
            ares.forEach((item) => {
                ids.push(item.postId);
            })
            let {
                data: aress
            } = await DB.collection("posts").where({
                _id: _.in(ids)
            }).get();
            this.setData({
                'postList': [
                    ...this.data.postList,
                    ...aress
                ]
            })
            this.setData({
                'isLoading': false
            });
        }
        wx.stopPullDownRefresh();
    },
    onLoad(options) {
        this.ontainCollectArticlePage();
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
        if (this.data.pageNum < this.data.pages) {
            this.setData({
                'isToast': false,
                'pageNum': this.data.pageNum + 1
            });
            if(this.data.tabIndex == 0){
                this.ontainCollectArticlePage(this.data.pageNum);
            
            }else if(this.data.tabIndex == 1){
                this.obtainCollectPostsPage(this.data.pageNum);
            }
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