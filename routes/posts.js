const express = require('express');
const router = express.Router();
const PostsControllers = require('../controllers/posts');
const HttpControllers = require('../controllers/http');

router.get('/', (req, res) => PostsControllers.getPosts(req, res));
router.post('/', (req, res) => PostsControllers.postPost(req, res));
router.delete('/', (req, res) => PostsControllers.deletePosts(req, res));
router.delete('/:id', (req, res) => PostsControllers.deletePost(req, res));
router.patch('/:id', (req, res) => PostsControllers.patchPost(req, res));
router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
