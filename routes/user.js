const express = require('express');
const router = express.Router();
const UserControllers = require('../controllers/user');
const HttpControllers = require('../controllers/http');
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require('../service/auth');


router.post('/signup', handleErrorAsync((req, res, next) => UserControllers.signup(req, res, next)));
router.post('/signin', handleErrorAsync((req, res, next) => UserControllers.signin(req, res, next)));
router.get('/profile', isAuth, handleErrorAsync((req, res, next) => UserControllers.profile(req, res, next)));
router.post('/updatePassword', isAuth, handleErrorAsync((req, res, next) => UserControllers.updatePassword(req, res, next)));

router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
