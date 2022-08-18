Component({
    color: "#A6A6A6",
    selectedColor: "#6BB071",
    backgroundColor: "#ffffff",
    data: {
        selected:0,
        color: "#A6A6A6",
        selectedColor: "#6BB071", //tabbar选中字体颜色
        list: [{
                "pagePath": "/pages/index/index",
                "text": "首页",
                "iconPath": "/images/index.png",
                "selectedIconPath": "/images/index-active.png"
            },
            {
                "pagePath": "/pages/community/community",
                "text": "农友圈",
                "iconPath": "/images/quan.png",
                "selectedIconPath": "/images/quan-active.png",

            },
            {
                "pagePath": "/pages/store/store",
                "text": "农资超市",
                "iconPath": "/images/shang.png",
                "selectedIconPath": "/images/shang-active.png"

            },
            {
                "pagePath": "/pages/my/my",
                "text": "我的",
                "iconPath": "/images/my.png",
                "selectedIconPath": "/images/my-active.png",

            }
        ], 
    },
    attached() {},
    methods: {
        switchTab(e) {
            const data = e.currentTarget.dataset;
            const url = data.path;
            const index = data.index;
            this.setData({
                'selected':index
            });
            wx.switchTab({
                url
            });
        }
    },
})