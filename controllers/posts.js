const { handleSuccess, appError } = require('../service/handles');
const Post = require('../model/postModel');
const Comment = require('../model/commentsModel');
const Imgur = require('../utils/imgur');
const roles = require('../service/roles');

const regexEscape = (str) => {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
} 

const posts = {
  async getPosts(req, res) {
    const findObj = {};
    req.query.userId !== undefined ? findObj.user = req.query.userId : "";
    req.query.q !== undefined ? findObj.content = new RegExp(regexEscape(req.query.q)) : "";
    const timeSort = req.query.timeSort === "asc" ? 1 : -1;
    const posts = await Post.find(findObj).populate({
      path: "user",
      select: "name avatar"
    }).populate({
      path: 'comments',
      select: 'comment user createdAt'
    }).sort({createdAt: timeSort});
    handleSuccess(res, posts);
  },
  async getPost(req, res) {
    const post = await Post.findById(req.params.id).populate({
      path: "user",
      select: "name avatar"
    }).populate({
      path: 'comments',
      select: 'comment user createdAt'
    });
    if (!post) return appError(40003, next, '找不到貼文喔')
    handleSuccess(res, post);
  },
  async getUserPosts(req, res) {
    const findObj = {};
    findObj.user = req.params.id;
    req.query.q !== undefined ? findObj.content = new RegExp(regexEscape(req.query.q)) : "";
    const timeSort = req.query.timeSort === "asc" ? 1 : -1;
    const posts = await Post.find({findObj}).populate({
      path:"user",
      select:"name _id avatar"
    }).sort({createdAt: timeSort});
    handleSuccess(res, {results: posts.length, posts});
  },
  async getLikeList(req, res) {
    const likeList = await Post.find({
      likes: { $in: [req.user.id] }
    }).populate({
      path:"user",
      select:"name _id avatar"
    });
    handleSuccess(res, {likeList});
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
    const searchPostId = await Post.findById(req.params.id);
    if (!searchPostId) return appError(40003, next, '找不到貼文喔');
    await Post.findByIdAndDelete(req.params.id);
    handleSuccess(res, '刪除資料成功')
  },
  async patchPost(req, res, next) {
    if (!roles.checkBody('post', req.body, next)) return
    Post.findByIdAndUpdate(req.params.id, req.body);
    handleSuccess(res, '修改資料成功');
  },
  async postPostLikes(req, res, next) {
    const searchPostId = await Post.findById(req.params.id);
    if (!searchPostId) return appError(40003, next, '找不到貼文喔');

    const _id = req.params.id;
    const hasLikes = await Post.findOne(
      { _id, likes: { $in: [req.user.id] } } 
    )
    if (hasLikes) return this.deletePostLikes(req, res, next);
    
    await Post.findOneAndUpdate(
      { _id },
      { $addToSet: { likes: req.user.id } }
    );
    res.status(201).json({
      status: 'success',
      postId: _id,
      userId: req.user.id
    });
  },
  async deletePostLikes(req, res, next) {
    const searchPostId = await Post.findById(req.params.id);
    if (!searchPostId) return appError(40003, next, '找不到貼文喔');
    const _id = req.params.id;
    await Post.findOneAndUpdate(
      { _id },
      { $pull: { likes: req.user.id } }
    );
    res.status(201).json({
      status: 'success',
      message: '已退讚'
    });
  },
  async postPostComment(req, res, next) {
    // 使用者 (留言者)
    const user = req.user.id;
    // 留言在哪一則貼文
    const post = req.params.id;
    const {comment} = req.body;
    const newComment = await Comment.create({
      post,
      user,
      comment
    });
    res.status(201).json({
        status: 'success',
        data: {
          comments: newComment
        }
    });
  },
  async deletePostComment(req, res, next) {
    const searchCommentId = await Comment.findById(req.params.id);
    if (!searchCommentId) return appError(40003, next, '沒有這則留言喔');
    await Comment.findByIdAndDelete(req.params.id);
    handleSuccess(res, '刪除留言成功')
  },
}

module.exports = posts;