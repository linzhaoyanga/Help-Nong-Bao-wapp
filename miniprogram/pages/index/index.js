const DB = wx.cloud.database();
Page({
    data: {
        openid: '', //openid
        zxList: [],
        isLoading: false, //节流阀
        pageNum: 1,
        pages: 0,
        isPageLoading: false,
        loadingText:'加载中...',
        swiperList: [],
        isToast: false,
        tabList:[],
        isHide: false
    },
    details(event) {
        const dataset = event.currentTarget.dataset;
        wx.navigateTo({
            url: "../../pakA/pages/details/details?id=" + dataset.id,
        });
    },
    skipPage(event) {
        const dataset = event.currentTarget.dataset;
        wx.navigateTo({
            url: '../../pakA/pages/cs/cs?id=' + dataset.id,
        })
    },
    goClassfiy(e) {
        wx.navigateTo({
            url: '../../pakA/pages/sortList/sortList?state=' + e.currentTarget.dataset.index+"&name="+e.currentTarget.dataset.name,
        })
    },
    async getIndexSwiperList() {
        const ares = await DB.collection('swiper').where({
                type: 'index'
            }).get();
        this.setData({
            'swiperList': ares.data[0].imgs
        })
    },
    async obtainIndexTabs() {
        let ares = await DB.collection("tab").where({
            'type': "index-tab"
        }).limit(1).get();
        this.setData({
            'tabList': ares.data[0].tab
        })
    },
    //获取咨询列表
    async getZxList(pageNum = 1, num = 5) {
        const _ = DB.command;
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            var total = 0;
            const res = await DB.collection('article').where({
                state: _.in([0,1]),
            }).count();
            total = res.total;
            let add = total % num > 0 ? 1 : 0;
            let pages = parseInt(total / num) + add;
            this.setData({
                'pages':pages
            })
            let begin = (pageNum - 1) * num;
            const ares = await DB.collection('article').where({
                    state:  _.in([0,1]),
                }).field({
                    "_id": true,
                    "coverPic": true,
                    "title": true,
                    "userId": true,
                    'userimg': true,
                    'username': true,
                    'createTime': true,
                    'supportVolume': true,
                    'readVolume':true,
                    'type': true
                })
                .orderBy("supportVolume", "desc").limit(num).skip(begin).get();
            this.setData({
                'zxList': [
                    ...this.data.zxList,
                    ...ares.data
                ]
            })
            this.setData({
                'isLoading': false
            });
            wx.stopPullDownRefresh();
        }

    },
    
    onLoad: function () {
        this.setData({
            'isPageLoading':true,
        })
        this.changeMode();
        this.obtainIndexTabs();
        this.getIndexSwiperList();
        this.getZxList();
        setTimeout(()=>{
            this.setData({
                'isPageLoading':false
            })
        },1000)
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
            success(res) {
            }
        })
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
    onShow: function () {
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        this.setData({
            'isToast':true,
        })
        if (this.data.pageNum < this.data.pages) {
            this.setData({
                'pageNum': this.data.pageNum + 1
            })
            this.getZxList(this.data.pageNum);
            this.setData({
                'isToast':false,
            });
        } else {
           this.setData({
               'loadingText':'— 没有了 —'
           })
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {},
    onRefresh: function () {
        this.setData({
            "isPageLoading": false,
            "pageNum": 1,
            'zxList': [],
            'pageNumZx': 1,
            'swiperList': []
        });
        this.getIndexSwiperList();
        this.getZxList();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.onRefresh();
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