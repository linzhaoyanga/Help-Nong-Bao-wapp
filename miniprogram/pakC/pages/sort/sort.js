// pakC/pages/sort/sort.js
const app = getApp();
const DB = wx.cloud.database();
Page({
    data: {
        tabList: [],
        isHide: app.globalData.isHide
    },
    async obtainStoreTabs() {
        let ares = await DB.collection("tab").where({
            'type': "store-tab"
        }).limit(1).get();
        this.setData({
            'tabList': ares.data[0].tab
        })
    },
    onLoad(options) {
        this.obtainStoreTabs();
    },
    goClassfiy(e){
        wx.navigateTo({
            url: '../sortList/sortList?type='+e.currentTarget.dataset.index+'&text='+this.data.tabList[e.currentTarget.dataset.index].text,
          })
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})