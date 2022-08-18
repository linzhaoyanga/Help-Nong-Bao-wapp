const DB = wx.cloud.database();
Page({
    data: {
        keyword: '',
        historyList: [],
        historys: [],
        aaa: 0,
        kkk: 0,
        isLoading: false,
        pageNum: 1,
        pages: 0,
        isToast: false,
        flog: false,
    },
    search(e) {
        this.setData({
            keyword: e.currentTarget.dataset.index
        })
        this.sosuo();
    },
    sosuo() {
        if(this.data.keyword == '')
         return
        this.obtainArticleListPage();
    },
    return () {
        this.setData({
            'keyword': '',
            'kkk': 0,
            'historyList': [],
            'isToast': false,
            'flog': false
        });
        if (this.data.historys.length != 0) {
            this.setData({
                'aaa': 1,
            });
        };

    },
    details(event) {
        const dataset = event.currentTarget.dataset;
        wx.navigateTo({
            url: "../details/details?id=" + dataset.id,
        });
    },
    async obtainArticleListPage(pageNum = 1, num = 5) {
        const _ = DB.command; 
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true,
                'aaa': 0,
                'kkk': 1
            });
            var total = 0;
            let res = await DB.collection('article').where(_.or([
                {title: DB.RegExp({
                    regexp: this.data.keyword,
                    options: 'i',
                }),},
                {coverText: DB.RegExp({
                    regexp: this.data.keyword,
                    options: 'i',
                }),}
            ])).count();
            total = res.total;
            let add = total % num > 0 ? 1 : 0;
            let pages = parseInt(total / num) + add;
            this.setData({
                'pages': pages
            })
            let begin = (pageNum - 1) * num;
            let ares = await DB.collection('article').where(_.or([
                {title: DB.RegExp({
                    regexp: this.data.keyword,
                    options: 'i',
                }),},
                {coverText: DB.RegExp({
                    regexp: this.data.keyword,
                    options: 'i',
                }),}
            ])).limit(num).skip(begin).get();
            this.setData({
                'historyList': [
                    ...this.data.historyList,
                    ...ares.data
                ],
                aaa: 0
            })
            if (this.data.historyList.length == 0) {
                this.setData({
                    'flog': true
                })
            }
            this.setData({
                'isLoading': false
            });
            let index = this.data.historys.findIndex((item) => item == this.data.keyword);
            if (index == -1) {
                this.data.historys.push(this.data.keyword);
                this.setData({
                    'historys': this.data.historys
                })
                wx.setStorageSync('historySearchArticleList', JSON.stringify(this.data.historys));
            }
        }
    },
    clearHistory() {
        this.setData({
            'aaa': 0,
            'historys': []
        })
        wx.setStorageSync('historySearchArticleList', '[]');
    },
    onLoad(options) {
        this.setData({
            'historys': JSON.parse(wx.getStorageSync('historySearchArticleList') || '[]')
        });
        if (this.data.historys.length != 0) {
            this.setData({
                aaa: 1,
            })
        }
    },
    onReady() {

    },
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
    onPullDownRefresh() {

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
            this.obtainArticleListPage(this.data.pageNum);

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