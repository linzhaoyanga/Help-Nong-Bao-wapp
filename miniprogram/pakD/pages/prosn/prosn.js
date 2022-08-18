// pages/prosn/prosn.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result:'',
    array:['中通快递','申通快递','圆通快递','顺丰快递','韵达快递','邮政','京东快递','极兔快递'],
    objectArray:[
      {
        id:0,
        name:'中通快递'
      },
      {
        id:1,
        name:'申通快递'
      },
      {
        id:2,
        name:'圆通快递'
      },
      {
        id:3,
        name:'顺丰快递'
      },
      {
        id:4,
        name:'韵达快递'
      },
      {
        id:5,
        name:'邮政'
      },
      {
        id:6,
        name:'京东快递'
      },
      {
        id:7,
        name:'中通快递'
      },
      {
        id:8,
        name:'极兔快递'
      }
    ]
    
  },
//扫一扫获取信息
  getscancode:function(){
  var  _this=this;
  wx.scanCode({
    success:(res)=>{
   var result=res.result;
   _this.setData({
    result:result,
   })
    }
  })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //地图
  getLocation(){
    
},
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '待收货'
    })
  },
  //无需寄件提示框
  showtip:function(){
    wx.showModal({
      title: '提示',
      content: '是否确定见面交易',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
//提交按钮
  show:function(){
    wx.showModal({
      title: '提示',
      content: '是否确认信息',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //选择快递公司的参数
  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})