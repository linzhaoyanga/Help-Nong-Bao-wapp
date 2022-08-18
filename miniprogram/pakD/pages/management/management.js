// pakA/pages/management/management.js
//创建数据库连接
const DB = wx.cloud.database();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        index: 0,
        list: [],
        ke: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getTotal();


    },
    getTotal: function () {
        DB.collection("article").get({
            //查询成功
            success: (res) => {
                console.log(res);
                this.setData({
                    list: res.data
                })
            },
            //失败
            fail: (err) => {
                console.log(err);
            }
        })
    },
    //控制顶部导航
    navSwitch: function (e) {
        var index = e.currentTarget.dataset.index;
        this.setData({
            index: index
        })
    },
    //去详情页
    aaa: function (e) {
        console.log(e.currentTarget.dataset.id)
        wx.navigateTo({
            url: "../details/details?id=" + e.currentTarget.dataset.id,
        });
    },

    //通过
    aab: function (e) {
        console.log(e.currentTarget.dataset.id)
        DB.collection("article").where({
            _id: e.currentTarget.dataset.id
        }).update({
            data: {
                state: 0
            },
            success: (res) => {
                console.log(res);
                wx.showToast({
                    title: '通过成功',
                    duration: 1000
                });
            },
            fail: (err) => {
                console.log(err);
            }
        })
    },

    //不通过
    aac: function (e) {
        console.log(e.currentTarget.dataset.id)
        DB.collection("article").where({
            _id: e.currentTarget.dataset.id
        }).update({
            //aaa:要修改的字段，如果要修改的字段不存在就新增该字段，要修改的字段存在，就修该字段的数据
            //要修改的该字段的数据
            data: {
                state: 3
            },
            //成功
            success: (res) => {
                console.log(res);
                wx.showToast({
                    title: '修改成功',
                    duration: 1000
                });
            },
            //失败
            fail: (err) => {
                console.log(err);
            }
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
        let x = this.data.ke + 20
        console.log(x)
        let old_data = this.data.list
        DB.collection('article').orderBy('time', 'desc').skip(x) // 限制返回数量为 20 条
            .get()
            .then(res => {
                // 利用concat函数连接新数据与旧数据
                // 并更新emial_nums  
                console.log(old_data.concat(res.data))
                console.log("-------------------------")
                console.log(x)
                this.setData({
                    list: old_data.concat(res.data),
                    ke: x
                })
                console.log(res.data)
                if (res.data.length == 0) {
                    wx.showLoading({
                        title: '没有更多内容',
                        duration: 1000
                    })
                }
            })
            .catch(err => {
                console.error(err)
            })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})