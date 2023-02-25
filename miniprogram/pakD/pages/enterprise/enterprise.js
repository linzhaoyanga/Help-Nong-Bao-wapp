// pages/individual/individual.js
const app = getApp();
const DB = wx.cloud.database();
Page({
    data: {
        isLoading: false,
        storeName: '',
        companyName: '',
        societyCode: '',
        legalName: '',
        idCard: '',
        phone: '',
        source: '',
        region: ['请选择省市区/县', '', ''],
        detailAddress: '',
        enterpriseSynopsis: '',
        isHide: app.globalData.isHide
    },
    //选择县区
    bindRegionChange: function (e) {
        this.setData({
            region: e.detail.value
        })
    },
    getUserProvince: function (e) {
        this.setData({
            region: e.detail.value //将用户选择的省市区赋值给region
        })
    },
    //上传图片
    uploadimg: function () {
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
                        that.setData({
                            source: ress.fileID
                        });
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
            this.data.companyName == '' ||
            this.data.societyCode == '' ||
            this.data.legalName == '' ||
            this.data.idCard == '' ||
            this.data.phone == '' ||
            this.data.source == '' ||
            this.data.region[2] == '' ||
            this.data.detailAddress == '' ||
            this.data.enterpriseSynopsis == '') {
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
                            type: 2, // 1 个体商户 2企业商户
                            state: 0, // 0 已提交 1 审核中 2 审核失败 3 审核成功 
                            time: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                            storeName: that.data.storeName,
                            companyName: that.data.companyName,
                            societyCode: that.data.societyCode,
                            legalName: that.data.legalName,
                            idCard: that.data.idCard,
                            phone: that.data.phone,
                            licenseImg: that.data.source,
                            easyAddress: that.data.region,
                            detailAddress: that.data.detailAddress,
                            enterpriseSynopsis: that.data.enterpriseSynopsis,
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
        });

    },
    deleteImg() {
        if (this.data.source != '') {
            wx.cloud.deleteFile({
                fileList: [toString(this.data.source)],
                success: res => {
                    this.setData({
                        source: ''
                    });
                },
                fail: console.error
            });
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
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