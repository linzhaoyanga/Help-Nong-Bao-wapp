// pakA/pages/note/note.js
const app = getApp();
const DB = wx.cloud.database();
Page({
    data: {
        articeList: [],
        isLoading: false,
        pageNum: 1,
        pages: 0,
        total: 0,
        flog: false,
        isToast: false
    },
    goPost(e) {
        wx.navigateTo({
            url: '../../../pakB/pages/post/post?id=' + e.currentTarget.dataset.id,
        })
    },
    getlist() {
        DB.collection("posts").where({
            _openid: app.globalData.openid,
        }).get({
            success: (res) => {
                this.setData({
                    articeList: res.data
                })
            },
            fail: (err) => {
                console.log(err);
            }
        })
    },
    async obtainPostsPage(pageNum = 1, num = 8) {
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            var total = 0;
            let res = await DB.collection('posts').where({
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
            } = await DB.collection("posts").where({
                flog: true,
                _openid: app.globalData.openid
            }).orderBy('time', 'desc').limit(num).skip(begin).get();
            this.setData({
                'articeList': [
                    ...this.data.articeList,
                    ...ares
                ]
            })
            this.setData({
                'isLoading': false
            });
        }
        wx.stopPullDownRefresh();
    },
    deletePost(e) {
        let id = e.currentTarget.dataset.id;
        let index = e.currentTarget.dataset.index;
        let that = this;
        wx.showModal({
            title: '温馨提示',
            content: '确定删除该帖子吗',
            confirmColor: '#497749',
            duration: 1000,
            success: (res) => {
                if (res.confirm) {
                    that.data.articeList.splice(index, 1);
                    console.log(that.data.articeList);
                    that.setData({
                        articeList: that.data.articeList
                    })
                    DB.collection("posts").where({
                        _id: id
                    }).remove({
                        success: (res) => {
                            wx.showToast({
                                title: '删除成功',
                                duration: 500
                            })
                        },
                        fail: (err) => {
                            console.log(err);
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    onLoad(options) {
        this.obtainPostsPage();
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
        this.setData({
            articeList: [],
            isLoading: false,
            pageNum: 1,
            pages: 0,
            total: 0,
            flog: false,
            isToast: false
        });
        this.obtainPostsPage();
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
            this.obtainPostsPage(this.data.pageNum);
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