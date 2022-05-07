const {handleSuccess, handleError, appError} = require('../service/handles');
const Post = require('../model/post');
const checkBody = require('../service/checkBody');

const posts = {
  async getPosts(req, res) {
    const findObj = {};
    req.query.userId !== undefined ? findObj.user = req.query.userId : "";
    req.query.q !== undefined ? findObj.content = new RegExp(req.query.q) : "";
    const timeSort = req.query.timeSort == "asc" ? "createdAt":"-createdAt";
    const posts = await Post.find(findObj).populate({
      path: "user",
      select: "name avatar"
    }).sort(timeSort);
    handleSuccess(res, posts);
  },
  async postPost(req, res, next) {
    const data = req.body;
    const isPass = checkBody('post', data, next);
    if (isPass) {
      const newPost = await Post.create({
        ...data
      });
      handleSuccess(res, newPost);
    } 
  },
  async deletePosts(req, res, next) {
    await Post.deleteMany({});
    handleSuccess(res, '刪除所有資料成功');
  },
  async deletePost(req, res, next) {
    const postId = req.params.id;
    const result = await Post.findByIdAndDelete(postId);
    if (result) handleSuccess(res, '刪除資料成功');
    else appError(400, '無此 ID', next);
  },
  async patchPost(req, res, next) {
    const postId = req.params.id
    const data = req.body;
    const isPass  = checkBody('post', data, next);
    if (isPass) {
      const result = await Post.findByIdAndUpdate(postId, data);
      if (result) handleSuccess(res, '修改資料成功');
      else appError(400, '無此 ID', next);
    }
  }
}

module.exports = posts;