const express = require('express');
const router = express.Router();
const PostsControllers = require('../controllers/posts');
const HttpControllers = require('../controllers/http');
const handleErrorAsync = require("../service/handleErrorAsync");
const upload = require('../service/upload');
const { isAuth } = require('../service/auth');

router.get('/', isAuth, handleErrorAsync((req, res, next) => PostsControllers.getPosts(req, res, next)));
router.get('/:id', isAuth, handleErrorAsync((req, res, next) => PostsControllers.getPost(req, res, next)));
router.post('/', isAuth, upload.array('photos', 10), handleErrorAsync((req, res, next) => PostsControllers.postPost(req, res, next)));
router.post('/:id/likes', isAuth, handleErrorAsync((req, res, next) => PostsControllers.postPostLikes(req, res, next)));
router.delete('/:id/likes', isAuth, handleErrorAsync((req, res, next) => PostsControllers.deletePostLikes(req, res, next)));
router.delete('/deleteAll', handleErrorAsync((req, res, next) => PostsControllers.deletePosts(req, res, next)));
router.delete('/delete/:id', handleErrorAsync((req, res, next) => PostsControllers.deletePost(req, res, next)));
router.patch('/:id', isAuth, handleErrorAsync((req, res, next) => PostsControllers.patchPost(req, res, next)));
router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
