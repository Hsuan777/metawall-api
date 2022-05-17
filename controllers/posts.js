const { handleSuccess, appError } = require('../service/handles');
const Post = require('../model/postModel');
const Imgur = require('../utils/imgur');
const roles = require('../service/roles');


const posts = {
  async getPosts(req, res) {
    const findObj = {};
    req.query.userId !== undefined ? findObj.user = req.query.userId : "";
    req.query.q !== undefined ? findObj.content = new RegExp(req.query.q) : "";
    const timeSort = req.query.timeSort == "asc" ? "createdAt" : "-createdAt";
    const posts = await Post.find(findObj).populate({
      path: "user",
      select: "name avatar"
    }).sort(timeSort);
    handleSuccess(res, posts);
  },
  async postPost(req, res, next) {
    if (!roles.checkBody('post', req.body, next)) return
    const newPostData = {
      user: req.user.id,
      content: req.body.content
    }
    if (req.files.length > 0) {
      newPostData.image = await Imgur.upload(req.files)
    }
    const newPost = await Post.create({
      ...newPostData
    });
    handleSuccess(res, newPost);
  },
  async deletePosts(req, res, next) {
    await Post.deleteMany({});
    handleSuccess(res, '刪除所有資料成功');
  },
  async deletePost(req, res, next) {
    await Post.findByIdAndDelete(req.params.id);
    handleSuccess(res, '刪除資料成功')
  },
  async patchPost(req, res, next) {
    if (!roles.checkBody('post', req.body, next)) return
    Post.findByIdAndUpdate(req.params.id, req.body);
    handleSuccess(res, '修改資料成功');
  }
}

module.exports = posts;