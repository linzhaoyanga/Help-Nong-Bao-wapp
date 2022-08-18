// pages/gdgn/tkewm/tkewm.js
const DB = wx.cloud.database();
const app = getApp();
Page({

    data: {
        fileID: "",
        title: "", //标题
        content: "", //内容
        xz: "",
        imtp: "",
        imgs: [],
        imgurl: "../../images/upload-img.png",
        type: "请选择运费",
        types: [
            '蔬菜',
            '水果',
            '粮油',
            '花卉',
            '茶叶',
            '兽药',
            '饲料',
            '农药',
            '种子',
            '农机',
            '渔业'
        ],
        region: ['请选择省市区/县', '', ''],
        typeIndex: 100, //分类下标
        goodType: 0, //分类
        num: 0, //数量
        price: 0, //价格
        originalPrice: 0, //原价
        freight: 0, //正常运费价格
        normal: 0, //正常运费
        remote: 0, //偏远地区运费
        isLoading: false,
        state: 0,
        businessId: '',
        typess: ""
    }, //选择县区
    bindRegionChange: function (e) {
        this.setData({
            region: e.detail.value
        })
    },
    deleteImg(e) {
        this.data.imgs.splice(e.currentTarget.dataset.index, 1);
        this.setData({
            'imgs': this.data.imgs
        });
        wx.cloud.deleteFile({
            fileList: [this.data.fileID],
            success: res => {
                console.log("ok");
            },
            fail: console.error
        });
    },
    //点击上传图片
    uniimg: function () {
        if (this.data.isLoading) {
            return
        } else {
            this.setData({
                'isLoading': true
            })
        }
        var that = this;
        var arr = this.data.imgs; //获取到数组
        if (arr.length <= 4) {
            wx.chooseImage({
                count: 1,
                success(res) {
                    if(!app.checkMedia(res.tempFilePaths[0],2)){
                        wx.showModal({
                            title: '温馨提示',
                            content: '图片内容不合法，请重新选择！',
                            showCancel: false,
                            confirmColor: '#497749',
                            duration: 1000,
                            complete:(res)=>{
                                that.setData({
                                    'isUpload': false
                                })
                            }
                        })
                        return
                    };
                    wx.cloud.uploadFile({
                        cloudPath: 'good/' + Math.floor(Math.random() * 1000000) + Date.now().toString(36),
                        filePath: res.tempFilePaths[0],
                        success(res) {
                            that.setData({
                                'fileID': res.fileID
                            })
                            arr.push(res.fileID); //把新的图片push进数组
                            that.setData({
                                imgs: arr
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
        } else {
            wx.showToast({
                title: '最多添加5个',
                icon: 'error',
                duration: 1500
            });
        }
    },
    //选择运费
    freight: function () {
        var that = this;
        wx.showActionSheet({
            itemList: ["免运费模板", "正常运费模板", "偏远地区模板"],
            success: res => {
                var ass = res.tapIndex;
                if (ass == 0) {
                    that.setData({
                        type: "免运费"
                    })
                }
                if (ass == 1) {
                    that.setData({
                        type: "正常运费模板"
                    })
                }
                if (ass == 2) {
                    that.setData({
                        type: "偏远地区模板"
                    })
                }
            }
        })
    },
    //分类
    changeTab: function (e) {
        var kw = e.currentTarget.dataset.id;
        const index = e.currentTarget.dataset.index;
        this.setData({
            typeIndex: index,
            goodType: kw
        })
    },
    //点击发布
    async function () {
        let that = this;
        var title = this.data.title, //标题
            content = this.data.content, //内容
            imgs = this.data.imgs, //图片
            goodType = this.data.goodType, //分类
            num = parseInt(this.data.num), //数量
            price = Number(this.data.price).toFixed(2), //价格
            originalPrice = Number(this.data.originalPrice).toFixed(2), //原价
            businessId = app.globalData.openid, //商家ID
            type = this.data.type, //设置运费模板
            freight = Number(this.data.freight).toFixed(2), //正常运费1
            normal = Number(this.data.normal).toFixed(2), //正常运费2
            remote = Number(this.data.remote).toFixed(2), //偏远地区运费
            shippingAddress = this.data.region[0] + " " + this.data.region[1] + " " + this.data.region[2];
        if (title == "") {
            wx.showToast({
                title: '请填写标题',
                icon: 'error',
                duration: 1000
            });
            return
        }

        if (content == "") {
            wx.showToast({
                title: '请填写描述',
                icon: 'error',
                duration: 1000
            });
            return
        }
        let check = await app.checkContext(title+content,1);
        if(!check){
            wx.showModal({
                title: '温馨提示',
                content: '标题或描述内容不合法，请检查后重新输入！',
                showCancel: false,
                confirmColor: '#497749',
                duration: 1000,
            })
            return
        }
        if (imgs.length == 0) {
            wx.showToast({
                title: '至少上传一张图片',
                icon: 'error',
                duration: 1000
            });
            return
        }
        if (goodType < 0) {
            wx.showToast({
                title: '请选择分类',
                icon: 'error',
                duration: 1000
            });
            return
        }
        if (num <= 0) {
            wx.showToast({
                title: '请填写数量',
                icon: 'error',
                duration: 1000
            });
            return
        }
        if (price == 0) {
            wx.showToast({
                title: '请填写价格',
                icon: 'error',
                duration: 1000
            });
            return
        }
        if (originalPrice == 0) {
            wx.showToast({
                title: '请填写原价',
                icon: 'error',
                duration: 1000
            });
            return
        }
        if (type == "请选择运费") {
            wx.showToast({
                title: '请选择运费',
                icon: 'error',
                duration: 1000
            });
            return
        }

        if (this.data.region[0] == "请选择省市区/县") {
            wx.showToast({
                title: '请选择发货地址',
                icon: 'error',
                duration: 1000
            });
            return
        }
        let obj = {}
        if (type == "免运费") {
            obj = {
                title: title,
                content: content,
                imgs: imgs,
                goodType: goodType,
                num: num,
                price: price,
                businessId: businessId,
                originalPrice: originalPrice,
                shippingAddress: shippingAddress,
                buyVolume: 0,
                freight: 0.00, //正常运费
                type: 1, //状态码
                state: 0,
                createTime: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                isSend: false
            };
        }
        if (type == "正常运费模板") {
            if (freight != 0) {
                obj = {
                    title: title,
                    content: content,
                    imgs: imgs,
                    goodType: goodType,
                    num: num,
                    businessId: businessId,
                    price: price,
                    originalPrice: originalPrice,
                    buyVolume: 0,
                    shippingAddress: shippingAddress,
                    freight: freight, //正常运费
                    type: 2, //状态码
                    state: 0,
                    createTime: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                    isSend: false

                };
            } else {
                wx.showToast({
                    title: '请填写运费',
                    icon: 'error',
                    duration: 1000
                });
                return
            }
        }
        if (type == "偏远地区模板") {
            if (normal != 0) {
                if (remote != 0) {
                    obj = {
                        title: title,
                        content: content,
                        imgs: imgs,
                        goodType: goodType,
                        num: num,
                        buyVolume: 0,
                        businessId: businessId,
                        price: price,
                        originalPrice: originalPrice,
                        shippingAddress: shippingAddress,
                        freight: normal, //正常运费
                        remote: remote, //偏远地区
                        type: 3, //状态码
                        state: 0,
                        createTime: app.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                        isSend: false
                    }
                } else {
                    wx.showToast({
                        title: '请填写偏远地区',
                        icon: 'error',
                        duration: 1000
                    });
                    return
                }
            } else {
                wx.showToast({
                    title: '请填写运费',
                    icon: 'error',
                    duration: 1000
                });
                return
            }
        }
        DB.collection("com").add({
            data: obj,
            success: (res) => {
                wx.showModal({
                    title: '发布成功',
                    content: '商品待审核，请稍等',
                    showCancel: false,
                    confirmColor: '#497749',
                    duration: 1000,
                    success: (res) => {
                        that.setData({
                            fileID: "",
                            title: "",
                            content: "",
                            xz: "",
                            imtp: "",
                            imgs: [],
                            imgurl: "../../images/upload-img.png",
                            type: "请选择运费",
                            region: ['请选择省市区/县', '', ''],
                            typeIndex: 100,
                            goodType: 0,
                            num: 0,
                            price: 0,
                            originalPrice: 0,
                            freight: 0,
                            normal: 0,
                            remote: 0,
                        });
                    }
                });
            },
            fail: (err) => {
                console.log(err);
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
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