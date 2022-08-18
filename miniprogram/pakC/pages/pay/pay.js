Page({

    data: {
        type:0,
        money:0
    },
    onLoad(options) {
        this.setData({
            'type':options.type,
            'money':options.money
        })
    },
    goOrder(){
        wx.navigateTo({
            url: '../../../pakD/pages/allorder/allorder',
        })
    },
    goStore(){
        wx.switchTab({
          url: '../../../pages/store/store',
        })
    },
    onReady() {

    },
    onShow() {

    },

    onHide() {

    },
    onUnload() {

    },

    onPullDownRefresh() {

    },

    onReachBottom() {

    },

    onShareAppMessage() {

    }
})