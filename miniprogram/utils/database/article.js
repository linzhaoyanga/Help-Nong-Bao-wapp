import dayjs from '../dayjs.min'; // dayjs库

const _ = wx.cloud.database().command;

function table(name) {
  return wx.cloud.database().collection(name);
}

/**
 * 用于添加文章
 * @param {object} articleObj 文章数据
 */
async function addArticle(articleObj) {
  return await table("article").add({
    data: articleObj
  });
}

/**
 * 通过文章ID获取文章的信息
 * @param {string} id 文章id
 */
async function getArticleById(id) {
  let {
    data: articleInfo
  } = await table("article").where({
    "_id": id
  }).get();

  return articleInfo;
}

export {
  addArticle,
  getArticleById
}