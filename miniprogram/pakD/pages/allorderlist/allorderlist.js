
const DB = wx.cloud.database();
const app = getApp()
Page({

    data: {
        list: [],
        listto: [],
        id:'',
    },
    changindex(e) {
        this.setData({
            indty: e.target.dataset.index
        })
    },
    onLoad(e) {
        this.setData({
            id: e.id
        })
        DB.collection("order").where({
            _id: e.id
        }).get({
            //查询成功
            success: (res) => {
                // console.log(res);
                console.log(res.data[0]);
                console.log(res.data[0].goods)
                this.setData({
                    list: res.data,
                    listto: res.data[0].goods
                })
            },
            //失败
            fail: (err) => {
                console.log(err);
            }
        })
    },
    goHair: function () {
        var id = this.data.id
        wx.showModal({
            title: '温馨提示',
            content: '确定取消订单？',
            // content: '这是一个模态弹窗',
            success: function (res) {
                DB.collection('order').where({
                    _id: id
                }).update({
                    // data 传入需要局部更新的数据
                    data: {
                      // 表示增加的字段
                      userOder:'用户取消订单'
                    },
                    success: function(res) {
                      console.log(res)
                      if(res.stats.updated == 1){
                        wx.showToast({
                            title: '等待商家审核',
                            duration: 1000
                        });
                      }
                    }
                  })
              
            }
        });
    },
//确认收货
    gogogo:function(){
        var id = this.data.id;
        wx.showModal({
            title: '温馨提示',
            content: '是否确认收货',
            success(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    DB.collection('order').where({
                        _id: id
                    }).update({
                        // data 传入需要局部更新的数据
                        data: {
                          // 表示增加的字段
                          state: 2,
                        },
                        success: function(res) {
                          console.log(res)
                          if(res.stats.updated == 1){
                            wx.showToast({
                                title: '收货成功',
                                duration: 1000,
                                success:(res)=>{
                                    wx.navigateBack();
                                }
                            });
                          }
                        }
                      })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})