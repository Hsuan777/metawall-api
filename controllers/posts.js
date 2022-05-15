const {handleSuccess, appError} = require('../service/handles');
const Post = require('../model/postModel');
const Imgur = require('../utils/imgur');
const roles = require('../service/roles');


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
    if (!roles.checkBody('post', data, next)) return
    if (req.files.length > 0) {
      data.image = await Imgur.upload(req.files)
    }
    const newPost = await Post.create({
      ...data,
    });
    handleSuccess(res, newPost);
  },
  async deletePosts(req, res, next) {
    await Post.deleteMany({});
    handleSuccess(res, '刪除所有資料成功');
  },
  async deletePost(req, res, next) {
    await Post.findByIdAndDelete(req.params.id)
      .then(() => handleSuccess(res, '刪除資料成功'))
      .catch(() => appError(40002, next));
  },
  async patchPost(req, res, next) {
    const isPass = checkBody('post', req.body, next);
    if (isPass) {
      await Post.findByIdAndUpdate(req.params.id, req.body)
        .then(() => handleSuccess(res, '修改資料成功'))
        .catch(() => appError(40002, next));
      ;
    }
  }
}

module.exports = posts;