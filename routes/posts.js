const express = require('express');
const router = express.Router();
const PostsControllers = require('../controllers/posts');
const HttpControllers = require('../controllers/http');
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");



router.get('/', (req, res) => PostsControllers.getPosts(req, res));
router.post('/', handleErrorAsync((req, res, next) => PostsControllers.postPost(req, res, next)));
router.post('/', handleErrorAsync((req, res, next) => PostsControllers.deletePosts(req, res, next)));
router.post('/', handleErrorAsync((req, res, next) => PostsControllers.deletePost(req, res, next)));
router.post('/', handleErrorAsync((req, res, next) => PostsControllers.patchPost(req, res, next)));
router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
