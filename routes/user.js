const express = require('express');
const router = express.Router();
const UserControllers = require('../controllers/user');
const HttpControllers = require('../controllers/http');
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require('../service/auth');
const upload = require('../service/upload');
const cors = require('cors');

router.get('/check', cors({ exposedHeaders: 'Authorization' }), isAuth, handleErrorAsync((req, res, next) => UserControllers.check(req, res, next)));
router.get('/profile', isAuth, handleErrorAsync((req, res, next) => UserControllers.profile(req, res, next)));
router.post('/signup', handleErrorAsync((req, res, next) => UserControllers.signup(req, res, next)));
router.post('/signin', cors({ exposedHeaders: 'Authorization' }), handleErrorAsync((req, res, next) => UserControllers.signin(req, res, next)));
router.post('/updatePassword', isAuth, handleErrorAsync((req, res, next) => UserControllers.updatePassword(req, res, next)));
router.patch('/profile', isAuth, upload.array('photo', 1), handleErrorAsync((req, res, next) => UserControllers.updateProfile(req, res, next)));

router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
