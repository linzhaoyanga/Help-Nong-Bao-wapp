var time = require('../../../utils/util.js');
const app = getApp();
const DB = wx.cloud.database();
Page({
    data: {
        formats: {},
        bottom: 0,
        readOnly: false,
        placeholder: '请输入文章内容......',
        _focus: false,
        title: "",
        array: ['粮食种植', '蔬菜种殖', '畜禽养殖', '花卉种植', '特种种植', '水果种植'],
        objectArray: [{
                id: 1,
                name: '粮食种植'
            },
            {
                id: 2,
                name: '蔬菜种殖'
            },
            {
                id: 3,
                name: '畜禽养殖'
            }, {
                id: 4,
                name: '花卉种植'
            }, {
                id: 5,
                name: '特种种植'
            }, {
                id: 6,
                name: '水果种植'
            },
        ],
        index: 0,
        articleObj: {
            title: "",
            type: "",
            createTime: '',
            userId: "",
            coverPic: "",
            coverText: "",
            readVolume:0,
            supportVolume: 0,
            context: '',
            username: '',
            state: 2,
        },
        isHide: app.globalData.isHide
    },

    onLoad() {
        this.setData({
            'articleObj.userId':app.globalData.userId,
            'articleObj.username':app.globalData.username
        });
    },
    formSubmit(e) {
        const that = this;
        this.editorCtx.getContents({
            success(res) {
                if (that.data.title == '') {
                    wx.showToast({
                        title: '请输入文章标题!',
                        duration: 2000,
                        icon: 'error'
                    });
                    return
                } else if (res.html == "<p><br></p>") {
                    wx.showToast({
                        title: '请输入文章内容!',
                        duration: 2000,
                        icon: 'error'
                    });
                    return
                }
                that.setData({
                    'articleObj.title': that.data.title,
                    'articleObj.context': res.html,
                    'articleObj.type': that.data.array[that.data.index],
                    'articleObj.createTime': app.formatDate(new Date(),'YYYY-MM-DD HH:mm:ss'),
                    'articleObj.coverText': res.text.slice(2)
                })
                var patt = /<img[^>]+src=['"]([^'"]+)['"]+/g;
                var result = [],
                    temp;
                while ((temp = patt.exec(res.html)) != null) {
                    result.push({
                        'url': temp[1]
                    });
                }
                if (result.length > 0) {
                    that.setData({
                        'articleObj.coverPic': result[0].url
                    });
                } else {
                    that.setData({
                        'articleObj.coverPic': ''
                    })
                }
                DB.collection("article").add({
                    data: that.data.articleObj,
                    success(res) {
                      console.log(res);
                        wx.showModal({
                            title: '发布成功',
                            content: '文章待审核，请稍等',
                            showCancel:false,
                            confirmColor:'#497749',
                            success:(res)=>{
                                that.setData({
                                    'title': '',
                                    'index': 0
                                });
                                that.clear();
                            }
                          })
                    },
                    fail(err) {
                        wx.showToast({
                            title: '发布失败',
                            duration: 1000,
                        });
                    }

                });
            }
        })
    },
    bindPickerChange(e) {
        this.setData({
            index: e.detail.value
        })
    },
    readOnlyChange() {
        this.setData({
            readOnly: !this.data.readOnly
        })
    },
    onEditorReady() {
        const that = this
        wx.createSelectorQuery().select('#editor').context(function (res) {
            that.editorCtx = res.context
        }).exec()
    },

    //后退
    undo() {
        this.editorCtx.undo()
    },

    //前进
    redo() {
        this.editorCtx.redo()
    },
    format(e) {
        let {
            name,
            value
        } = e.target.dataset
        if (!name) return
        this.editorCtx.format(name, value)
    },

    onStatusChange(e) {
        const formats = e.detail
        this.setData({
            formats
        })
    },
    insertDivider() {
        this.editorCtx.insertDivider({
            success: function () {
                console.log('insert divider success')
            }
        })
    },
    //删除 清空
    clear() {
        this.editorCtx.clear({
            success: function (res) {
                console.log("clear success")
            }
        })
    },
    removeFormat(e) {
        console.log(e)
        this.editorCtx.removeFormat()
    },
    insertDate() {
        const date = new Date()
        const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
        this.editorCtx.insertText({
            text: formatDate
        })
    },
    //插入图片
    insertImage() {
        const that = this
        wx.chooseImage({
            count: 1,
            success: function (res) {
                wx.showLoading({
                    title: '正在上传图片',
                })
                wx.cloud.uploadFile({
                    cloudPath: `news/upload/${time.formatTime(new Date)}/${Math.floor(Math.random() * 100000000)}.png`, // 上传至云端的路径
                    filePath: res.tempFilePaths[0], 
                    success: cover => {
                        that.editorCtx.insertImage({
                            src: cover.fileID,
                            data: {
                                id: cover.fileID,
                                role: 'god'
                            },
                            success: function () {
                                wx.hideLoading()
                            }
                        })
                    }
                })
            }
        })
    },
    onShow: function () {
    },
})