// pages/call/call.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  //跳转到个体商户页面
  individual(){
    wx.navigateTo({
      url:'../../pages/individual/individual',
    })
  },
  //跳转到企业商户页面
  enterprise(){
    wx.navigateTo({
      url:'../../pages/enterprise/enterprise',
    })
  }
})