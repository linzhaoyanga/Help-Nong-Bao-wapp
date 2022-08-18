// pages/individual/individual.js
const app = getApp()
const DB = wx.cloud.database();
Page({
    data: {
        isLoading: false,
        storeName: '',
        name: '',
        wxNum: '',
        idCard: '',
        phone: '',
        idCardz: '',
        idCardf: '',
        typess: ''
    },
    //上传图片
    uploadimg(e) {
        if (this.data.isLoading) {
            return
        } else {
            this.setData({
                'isLoading': true
            })
        }
        var that = this;
        wx.chooseImage({
            count: 1,
            success: (res) => {
                wx.cloud.uploadFile({
                    cloudPath: 'merchantSettlement/' + Math.floor(Math.random() * 1000000) + Date.now().toString(36) + '.png',
                    filePath: res.tempFilePaths[0],
                    success: (ress) => {
                        if (e.currentTarget.dataset.id == "1") {
                            that.setData({
                                idCardz: ress.fileID
                            })
                        } else {
                            that.setData({
                                idCardf: ress.fileID
                            })
                        }
                    }
                })
            },
            complete(res) {
                that.setData({
                    'isLoading': false
                })
            }

        })

    },
    priviewImg(e) {
        const src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: [src],
        });
    },
    //提交信息代码
    submit: function () {
        let that = this;
        if (this.data.storeName == '' ||
            this.data.name == '' ||
            this.data.wxNum == '' ||
            this.data.idCard == '' ||
            this.data.phone == '' ||
            this.data.idCardf == '' ||
            this.data.idCardz == ''
        ) {
            wx.showModal({
                title: '提示',
                content: '信息录入不完整，注意每一项都为必填项，请检查后再提交',
                showCancel: false,
                confirmColor: '#497749'
            })
            return

        }
        wx.showModal({
            title: '温馨提示',
            content: '是否确定提交',
            confirmColor: '#497749',
            success(res) {
                if (res.confirm) {
                    DB.collection("merchantSettlement").add({
                        data: {
                            userId: app.globalData.userId,
                            username: app.globalData.username,
                            userimg: app.globalData.userimg,
                            type: 1, // 1 个体商户 2企业商户
                            state: 0, // 0 已提交 1 审核失败 2 审核成功   
                            time: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                            storeName: that.data.storeName,
                            name: that.data.name,
                            wxNum: that.data.wxNum,
                            idCard: that.data.idCard,
                            phone: that.data.phone,
                            idCardf: that.data.idCardf[0],
                            idCardz: that.data.idCardz[0],
                            result: '' //审核结果 
                        },
                        success: (res) => {
                            wx.showToast({
                                title: '提交成功',
                                duration: 1000,
                                success: (res) => {
                                    wx.switchTab({
                                        url: '../../../pages/my/my',
                                    })
                                }
                            })
                        },
                        fail: (err) => {
                            wx.showToast({
                                title: '提交失败',
                                icon: 'error',
                                duration: 1000,
                            })
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    deleteImg(e) {
        let temp = ''
        if (e.currentTarget.dataset.id == "1") {
            temp = this.data.idCardz[0]
        } else {
            temp = this.data.idCardf[0]
        }
        wx.cloud.deleteFile({
            fileList: [toString(temp)],
            success: res => {
                if (e.currentTarget.dataset.id == "1") {
                    this.setData({
                        idCardz: ''
                    })
                } else {
                    this.setData({
                        idCardf: ''
                    })
                }
            },
            fail: console.error
        });
    },
    onLoad: function (options) {
        this.changeMode();
    },
    changeMode() {
        let that = this;
        DB.collection("state").where({
            json: 1
        }).get({
            success: (res) => {
                if (res.data.length == 1) {
                    this.setData({
                        'typess': 1
                    })
                }
                if (res.data.length == 2) {
                    this.setData({
                        'typess': 2
                    })
                }
            }
        })
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})