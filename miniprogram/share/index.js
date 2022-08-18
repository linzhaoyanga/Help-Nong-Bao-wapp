import {
    action,
    observable
} from 'mobx-miniprogram'

export const store = observable({
    //购物车中得商品
    goods: JSON.parse(wx.getStorageSync('goods') || '[]'),
    flog: JSON.parse(wx.getStorageSync('flog') || 'false'),
    address: JSON.parse(wx.getStorageSync('address') || '{}'),
    postId: wx.getStorageSync('postId'),
    singleGood:JSON.parse(wx.getStorageSync('singleGood') || '{}'),
    isCart:JSON.parse(wx.getStorageSync('isCart') || '1'),
    user:JSON.parse(wx.getStorageSync('user') || '{}'),
    get num() {
        let num = 0;
        this.goods.forEach((item) => {
            num += item.num;
        })
        return num;
    },
    //总价
    get goodsPrice() {
        let totalPrice = 0;
        this.goods.forEach((item) => {
            if (item.flog) {
                totalPrice += item.num * item.price;
            }
        })
        return Number(totalPrice).toFixed(2);
    },
    get portPrice() {
        let price = 0;
        this.goods.forEach((item) => {
            if (item.type != 1) {
                if (this.flog && item.remotePostPrice) {
                    price += item.remotePostPrice;
                } else if (!this.flog && item.normalPostPrice) {
                    price += item.normalPostPrice;
                }
            }
        });
        return Number(price).toFixed(2);
    },
    get totalPrice() {
        return (Number(this.goodsPrice) + Number(this.returnGoodsPortPrice())).toFixed(2);
    },
    //选择数
    get choseNum() {
        let num = 0;
        this.goods.forEach((item) => {
            if (item.flog) {
                num = num + item.num;
            }
        });
        return num;
    },
    get chooseGoods() {
        let temp = [];
        this.goods.forEach((item) => {
            if (item.flog) {
                temp.push(item);
            }
        });
        return temp;
    },
    removeChoseGoods:action(function (obj){
        this.goods.forEach((item,index) => {
            if (item.flog) {
                this.goods.splice(index,1);
            }
        });
    }),
    updateGoods: action(function (obj) {
        let index = this.goods.findIndex((item) => {
            return item.id == obj.id
        })
        if (index == -1) {
            this.goods.push(obj);
            wx.showToast({
                title: '添加成功',
                duration: 1000,
            })
        } else {
            let total = this.goods[index].total;
            let num = this.goods[index].num;
            if (num >= total) {
                wx.showToast({
                    icon: 'error',
                    title: '库存不足',
                    duration: 1000,
                })
            } else {
                this.goods[index].num = this.goods[index].num + 1;
                wx.showToast({
                    title: '添加成功',
                    duration: 1000,
                })
            }
        }
        wx.setStorageSync('goods', JSON.stringify(this.goods));
    }),
    updateFlog: action(function (obj) {
        this.flog = obj;
        wx.setStorageSync('flog', JSON.stringify(obj));
    }),
    beforeAction: action(function (obj) {
        wx.setStorageSync('goods', JSON.stringify(obj));
    }),
    returnGoods: action(function () {
        return this.goods;
    }),
    returnGoodsPortPrice: action(function () {
        let price = 0;
        this.goods.forEach((item) => {
            if (item.type != 1) {
                if (this.flog && item.type == 3) {
                    price += Number(item.remotePostPrice);
                } else if (!this.flog) {
                    price += Number(item.normalPostPrice);
                }
            }
        });
        return Number(price).toFixed(2);
    }),
    returnTotalPrice: action(function () {
        return (Number(this.goodsPrice) + Number(this.returnGoodsPortPrice())).toFixed(2);
    }),
    updateAddress: action(function (obj) {
        this.address = obj;
        wx.setStorageSync('address', JSON.stringify(obj));
    }),
    removeAddress: action(function (id) {
        if (this.address._id == id) {
            this.address = {};
            wx.setStorageSync('address', JSON.stringify({}));
        }
    }),
    returnAddress: action(function (obj) {
        return this.address;
    }),
    updatePostId:action(function (obj){
        this.postId = obj;
        wx.setStorageSync('postId', obj);
    }),
    updateSingleGood: action(function (obj) {
        this.singleGood = obj;
        wx.setStorageSync('singleGood', JSON.stringify(obj));
    }),
    updateIsCart: action(function (obj) {
        this.isCart = obj;
        wx.setStorageSync('isCart', JSON.stringify(obj));
    }),
    updateUser: action(function (obj) {
        this.user = obj;
        wx.setStorageSync('user', JSON.stringify(obj));
    }),
    returnUser: action(function (obj) {
        return this.user;
    }),
});