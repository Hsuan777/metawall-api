const {handleSuccess, appError} = require('../service/handles');
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
    try {
      await Post.findByIdAndDelete(postId);
      handleSuccess(res, '刪除資料成功');
    } catch {
      appError(40002, next);
    }
  },
  async patchPost(req, res, next) {
    const postId = req.params.id
    const data = req.body;
    const isPass  = checkBody('post', data, next);
    if (isPass) {
      try {
        await Post.findByIdAndUpdate(postId, data);
        handleSuccess(res, '修改資料成功');
      } catch {
        appError(40002, next);
      }
    }
  }
}

module.exports = posts;