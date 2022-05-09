const express = require('express');
const router = express.Router();
const PostsControllers = require('../controllers/posts');
const HttpControllers = require('../controllers/http');
const handleErrorAsync = require("../service/handleErrorAsync");

router.get('/', handleErrorAsync((req, res, next) => PostsControllers.getPosts(req, res, next)));
router.post('/', handleErrorAsync((req, res, next) => PostsControllers.postPost(req, res, next)));
router.delete('/deleteAll', handleErrorAsync((req, res, next) => PostsControllers.deletePosts(req, res, next)));
router.delete('/:id', handleErrorAsync((req, res, next) => PostsControllers.deletePost(req, res, next)));
router.patch('/:id', handleErrorAsync((req, res, next) => PostsControllers.patchPost(req, res, next)));
router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
