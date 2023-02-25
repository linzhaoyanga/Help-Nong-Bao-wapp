// pakA/pages/search/search.js
const DB = wx.cloud.database();
Page({

    /**
     * 页面的初始数据
     */

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
        this.obtainhistoryListPage();
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
        }
    },
    async obtainhistoryListPage(pageNum = 1, num = 5) {
        if (!this.data.isLoading) {
            this.setData({
                'isLoading': true,
                'aaa': 0,
                'kkk': 1
            });
            var total = 0;
            let res = await DB.collection('goods').where({
                title: DB.RegExp({
                    regexp: this.data.keyword,
                    options: 'i',
                }),
                state: 1
            }).count();
            total = res.total;
            let add = total % num > 0 ? 1 : 0;
            let pages = parseInt(total / num) + add;
            this.setData({
                'pages': pages
            })
            let begin = (pageNum - 1) * num;
            let ares = await DB.collection("goods").where({
                title: DB.RegExp({
                    regexp: this.data.keyword,
                    options: 'i',
                }),
                state: 1
            }).limit(num).skip(begin).get();
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
                wx.setStorageSync('historySearchGoodList', JSON.stringify(this.data.historys));
            }
        }
    },
    //跳转
    index(e) {
        wx.navigateTo({
            url: '../good/good?id=' + e.currentTarget.dataset.index,
        })
    },
    clearHistory() {
        this.setData({
            'aaa': 0,
            'historys': []
        })
        wx.setStorageSync('historySearchGoodList','[]');
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            'historys': JSON.parse(wx.getStorageSync('historySearchGoodList') || '[]')
        });
        if (this.data.historys.length != 0) {
            this.setData({
                aaa: 1,
            })
        }
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
    onReachBottom: function () {
        if (this.data.pageNum < this.data.pages) {
            this.setData({
                'isToast': false,
                'pageNum': this.data.pageNum + 1
            })
            this.obtainhistoryListPage(this.data.pageNum);

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