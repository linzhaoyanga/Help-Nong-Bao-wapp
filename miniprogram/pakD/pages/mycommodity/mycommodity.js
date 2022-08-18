const DB = wx.cloud.database();
const app = getApp()
Page({
    data: {
        aa: 0,
        list: [],
        isLoading:false,
        isToast:false
    },
    index(e) {
        let index = Number(e.currentTarget.dataset.index);
        this.setData({
            aa: index,
            list: []
        });
        if (index == 2) {
            index = 3;
        }
        this.obtainMyGoodsByUserId(index);
    },
    obtainMyGoodsByUserId(state) {
        this.setData({
            'isToast':false
        })
        if(!this.data.isLoading){
            this.setData({
                'isLoading':true,
                'isToast':false
            })
            let where = {};
            if (state == 0) {
                where = {
                    _openid: app.globalData.openid
                }
            } else {
                where = {
                    _openid: app.globalData.openid,
                    state: state
                }
            }
            DB.collection("com").where(where).orderBy("createTime", "desc").get({
                success: (res) => {
                    this.setData({
                        list: res.data,
                        'isLoading':false
                    });
                    if(this.data.list.length == 0){
                        this.setData({
                            'isToast':true
                        })
                    }
                },
                fail: (err) => {
                    console.log(err);
                }
            });
        }
    },
    onLoad(options) {
        this.obtainMyGoodsByUserId();
    },
    goGood(e) {
        wx.navigateTo({
            url: '../../../pakC/pages/good/good?id=' + e.currentTarget.dataset.id,
        })
    },
    goodReduce(e) {
        let id = e.currentTarget.dataset.id;
        let index = Number(e.currentTarget.dataset.index);
        let state = Number(e.currentTarget.dataset.state);
        if (state == 1 || state == 3) {
            if (state == 1) {
                state = 3;
            } else if (state == 3) {
                state = 1;
            }
            DB.collection("com").where({
                '_id': id,
            }).update({
                data: {
                    'state': state
                },
                success: (res) => {
                    if (res.stats.updated == 1) {
                        wx.showModal({
                            title: '温馨提示',
                            content: state == 3 ? '下架成功':'上架成功',
                            showCancel: false,
                            confirmColor: '#497749',
                            duration: 1000,
                            complete: (res) => {
                                this.data.list.splice(index,1);
                                this.setData({
                                    'list':this.data.list
                                })
                            }
                        });
                    }
                },
                fail: (fali) => {
                    console.log(fali);
                }
            })
        }
    },
    onReady: function () {

    },


    onShow: function () {

    },


    onHide: function () {

    },

    onUnload: function () {

    },

    onPullDownRefresh: function () {

    },


    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})