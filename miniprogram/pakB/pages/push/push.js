// pakB/pages/push/push.js
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "../../../share/index"
const app = getApp();
const DB = wx.cloud.database();
Page({
    data: {
        context: '',
        imgs: [],
        isUpload: false,
        postId: '',
        typess:'',
    },
    uploadimg() {
        if (this.data.isUpload) {
            return
        } else {
            this.setData({
                'isUpload': true
            })
        }
        var that = this;
        wx.chooseImage({
            count: 1,
            success: (res) => {
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
                    cloudPath: 'posts/' + app.globalData.username + '/' + Math.floor(Math.random() * 1000000) + Date.now().toString(36) + '.png',
                    filePath: res.tempFilePaths[0],
                    success: (ress) => {
                        that.data.imgs.push(ress.fileID);
                        that.setData({
                            'imgs': that.data.imgs
                        })
                    }
                })
            },
            complete(res) {
                that.setData({
                    'isUpload': false
                })
            }
        })

    },
    deleteImg(e) {
        let index = e.currentTarget.dataset.index;
        let temp = this.data.imgs[index];
        wx.cloud.deleteFile({
            fileList: [toString(temp)],
            success: res => {
                this.data.imgs.splice(index, 1);
                this.setData({
                    'imgs': this.data.imgs
                })
            },
            fail: console.error
        });
    },
    priviewImg(e) {
        const src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: [...this.data.imgs],
        })
    },
    async push() {
        if (this.data.context == '') {
            wx.showToast({
                title: '未填写帖子内容哦',
                duration: 1000,
                icon: 'error'
            });
            return
        }
        let check = await app.checkContext(this.data.context,3);
        if(!check){
            wx.showModal({
                title: '温馨提示',
                content: '帖子内容不合法，请重新输入！',
                showCancel: false,
                confirmColor: '#497749',
                duration: 1000,
                complete:(res)=>{
                    this.setData({
                        'context':''
                    })
                }
            })
            return
        }
        DB.collection('posts').add({
            data: {
                context: this.data.context,
                imgs: this.data.imgs,
                commentVolume: 0,
                supportVolume: 0,
                time: +new Date(),
                flog: true,
                userid: app.globalData.userId,
                username: app.globalData.username,
                userimg: app.globalData.userimg,
                isSupport: false,
                temp: 1,
            },
            success: (res) => {
                wx.showToast({
                    title: '发布成功',
                    duration: 1000,
                    success: () => {
                        this.setData({
                            'postId': res._id
                        });
                        this.updatePostId(this.data.postId);
                        wx.switchTab({
                            url: '/pages/community/community',
                        });
                    }
                })

            },
            fail: () => {
                wx.showToast({
                    title: '发布失败',
                    duration: 1000,
                    icon: 'error'
                })
            }
        })
    },
    onLoad(options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['user'],
            actions: ['updatePostId',"returnUser"]
        });
        this.changeMode();
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
            success(res) {
                console.log('showShareMenu', res);
            }
        })
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
    onShareTimeline(res) {
        return {
            title: this.data.postInfo.context,
            path: '/pakB/pages/post/post?id=' + this.data.postInfo._id,
            imageUrl: this.data.postInfo.imgs[0],
            success: function (res) {
                console.log('分享成功')
            },
            fail: function (res) {
                console.log('分享失败')
            }
        }
    },
    onShareAppMessage(res) {
        if (res.from == 'button') {
            return {
                title: this.data.postInfo.context,
                path: '/pakB/pages/post/post?id=' + this.data.postInfo._id,
                imageUrl: this.data.postInfo.imgs[0],
                success: function (res) {
                    console.log('分享成功')
                },
                fail: function (res) {
                    console.log('分享失败')
                }
            }
        } else {
            return {
                title: this.data.postInfo.context,
                path: '/pakB/pages/post/post?id=' + this.data.postInfo._id,
                imageUrl: this.data.postInfo.imgs[0],
                success: function (res) {
                    console.log('分享成功')
                },
                fail: function (res) {
                    console.log('分享失败')
                }
            }
        }
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
    onHide() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {},

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