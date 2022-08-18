const DB = wx.cloud.database();
Page({
    data: {
        openid: '',
        articeList: [],
        isLoading: false,
        pageNum: 1,
        isPageLoading: false,
        types: [
            '全部', '粮食种植', '蔬菜种植', '畜禽养殖', '花卉种植', '特种种植','水果种植'
        ],
        typeIndex: 0,
        emptyIndex: 0,
        flog: false,
        pages: 0,
    },
    details(event) {
        const dataset = event.currentTarget.dataset;
        wx.navigateTo({
            url: "../details/details?id=" + dataset.id,
        });
    },
    goSearch() {
        wx.navigateTo({
            url: '../search/search'
        })
    },
    skipPage(event) {
        const id = event.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../../pakA/pages/cs/cs?id=' + id,
        })
    },
    changeTab(e) {
        const index = e.currentTarget.dataset.index;
        this.setData({
            'articeList': [],
            'typeIndex': index,
            'emptyIndex': 0,
            'flog': false
        })
        this.getArticeList(1, 10, index);

    },
    async getArticeList(pageNum = 1, num = 10, where = 0, state = 0) {
        const _ = DB.command;
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true
            });
            var total = 0;
            const res = await DB.collection('article').where({
                state: state
            }).count();
            total = res.total;
            if (where != 0) {
                let l = await DB.collection('article').where({
                    type: this.data.types[where],
                    state: state
                }).count();
                total = l.total;
            }
            let add = total % num > 0 ? 1 : 0;
            let pages = parseInt(total / num) + add;
            this.setData({
                'pages': pages
            });
            let begin = (pageNum - 1) * num;
            let ares = null;
            if (where == 0) {
                ares = await DB.collection('article').where({
                    state: state
                }).orderBy("createTime","desc").orderBy("readVolume","desc").orderBy("supportVolume", "desc").limit(num).skip(begin).get();
            } else {
                ares = await DB.collection('article').where({
                    type: this.data.types[where],
                    state: state
                }).orderBy("createTime","desc").orderBy("readVolume","desc").orderBy("supportVolume", "desc").limit(num).skip(begin).get();
            }
            this.setData({
                'articeList': [
                    ...this.data.articeList,
                    ...ares.data
                ]
            })
            if (this.data.articeList.length == 0) {
                this.setData({
                    'flog': true
                })
            }
            this.setData({
                'isLoading': false,
            });
        }

    },
    init() {
        if (this.data.state == 0) {
            this.getArticeList();
        } else if (this.data.state == 1) {
            this.getArticeList(1, 10, 0, 1);
        } else if (this.data.state == 2) {
            this.getArticeList(1, 10, 0, 2);
        } else if (this.data.state == 3) {
            this.getArticeList(1, 10, 0, 3);
        }


    },
    onLoad: function (e) {
        this.setData({
            state: e.state + ""
        });
        wx.setNavigationBarTitle({
            title: e.name,
        });
        this.init();
    },
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

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
        if (this.data.pageNum < this.data.pages) {
            this.setData({
                'isToast': false,
                'pageNum': this.data.pageNum + 1
            })
            if (this.data.state == 0) {
                this.getArticeList(this.data.pageNum, 10, this.data.typeIndex);

            } else if (this.data.state == 1) {
                this.getArticeList(this.data.pageNum, 10, 0, 1);

            } else if (this.data.state == 2) {
                this.getArticeList(this.data.pageNum, 10, 0, 2);
            } else if (this.data.state == 3) {
                this.getArticeList(this.data.pageNum, 10, 0, 3);

            }
        } else {
            this.setData({
                isToast: true
            })
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})