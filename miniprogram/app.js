wx.cloud.init({
    env: 'jiajia123-7gzqvr8i9155e1b8'
});
const DB = wx.cloud.database();
import dayjs from '/utils/dayjs.min.js'
import {
    createStoreBindings
} from "mobx-miniprogram-bindings"
import {
    store
} from "./share/index"
App({
    globalData: {
        username: '',
        userimg: '',
        openid: '',
        userId: '',
        flog: false,
        isMerchant: false,
        isHide: false
    },
    onLaunch: function () {
        this.changeMode();
        const that = this;
        this.storeBindings = createStoreBindings(this, {
            store,
            actions: ['updateUser']
        });
        wx.cloud.callFunction({
            name: 'gitOpenId',
            complete: res => {
                that.globalData.openid = res.result.openid;
                that.aaaa();
                that.getuser();
            }
        });
    },
    aaaa() {
        DB.collection("merchantSettlement").where({
            _openid: this.globalData.openid,
            state: 3
        }).get({
            success: (res) => {
                if (res.data[0].state == 3) {
                    this.globalData.isMerchant = true;
                }
            }
        })
    },
    changeMode() {
        const that = this;
        DB.collection("state").where({
            isHide: true
        }).get({
            success: (res) => {
                if (res.data.length == 1) {
                    that.globalData.isHide = true;
                }
            }
        })
    },
    getuser() {
        let that = this;
        let openid = this.globalData.openid;
        DB.collection("users").where({
            _openid: openid
        }).get({
            success: (res) => {
                if (res.data.length == 0) {
                    wx.showModal({
                        title: '温馨提示',
                        content: '您第一次登录是否授权用户信息 ',
                        success: (res) => {
                            if (res.confirm) {
                                wx.getUserProfile({
                                    desc: '展示用户信息',
                                    success: (res) => {
                                        this.globalData.username = res.userInfo.nickName;
                                        this.globalData.userimg = res.userInfo.avatarUrl;
                                        this.globalData.openid = openid;
                                        this.globalData.flog = false
                                        DB.collection("users").add({
                                            data: {
                                                userimg: res.userInfo.avatarUrl,
                                                username: res.userInfo.nickName,
                                                flog: false
                                            },
                                            success: (ressss) => {
                                                that.updateUser({
                                                    userId: ressss._id,
                                                    openid: openid,
                                                    username: res.userInfo.nickName,
                                                    userimg: res.userInfo.avatarUrl,
                                                    flog: false,
                                                    isMerchant: that.globalData.isMerchant,
                                                    typess: that.globalData.typess
                                                });
                                            },
                                        })

                                    },
                                    fail: (fail) => {
                                        that.updateUser({
                                            userId: "",
                                            openid: openid,
                                            username: "",
                                            userimg: "",
                                            flog: "",
                                            isMerchant: "",
                                            typess: ""
                                        });
                                    }
                                })
                            } else {
                                that.updateUser({
                                    userId: "",
                                    openid: openid,
                                    username: "",
                                    userimg: "",
                                    flog: "",
                                    isMerchant: "",
                                    typess: ""
                                });
                            }
                        },
                        fail: (fail) => {
                            that.updateUser({
                                userId: "",
                                openid: openid,
                                username: "",
                                userimg: "",
                                flog: "",
                                isMerchant: "",
                                typess: ""
                            });
                        }
                    });
                } else {
                    that.globalData.username = res.data[0].username;
                    that.globalData.userimg = res.data[0].userimg;
                    that.globalData.openid = res.data[0]._openid;
                    that.globalData.userId = res.data[0]._id;
                    that.globalData.flog = res.data[0].flog;
                    that.updateUser({
                        userId: res.data[0]._id,
                        openid: res.data[0]._openid,
                        username: res.data[0].username,
                        userimg: res.data[0].userimg,
                        flog: res.data[0].flog,
                        isMerchant: that.globalData.isMerchant,
                        typess: that.globalData.typess
                    });
                }
            },
        })
    },
    //全局方法处理时间 YYYY-MM-DD HH:mm:ss
    formatDate(obj, str = "YYYY-MM-DD") {
        return dayjs(obj).format(str);
    },
    updateGlobalData(obj) {
        this.globalData = obj;
    },
    //检测文字内容是否合法
    async checkContext(content, scene) {
        //scene 场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
        let result = false;
        let res = await wx.cloud.callFunction({
            name: 'checkContext',
            data: {
                content: content,
                scene: scene
            },
        });
        if (res.result.result.label == 100) {
            result = true;
        }
        return result;
    },
    //检测媒体内容是否合法
    async checkMedia(url, type) {
        //  type 1 媒体 2 图片
        let result = false;
        let res = await wx.cloud.callFunction({
            name: 'checkMedia',
            data: {
                url: url,
                type: type
            },
        });
        if (res.result.errCode == 0) {
            result = true;
        }
        return result;
    }
});