// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    //type 1音频 2 图片
    try {
        const wxContext = cloud.getWXContext().OPENID;
        const result = await cloud.openapi.security.mediaCheckAsync({
            "openid": wxContext,
            "scene": 3,
            "version": 2,
            "mediaUrl": event.url,
            "mediaType": event.type,
        })
        return result
    } catch (err) {
        return err
    }
}