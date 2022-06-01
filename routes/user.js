const express = require('express');
const router = express.Router();
const passport = require('passport');
const UserControllers = require('../controllers/user');
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require('../service/auth');
const upload = require('../service/upload');
const cors = require('cors');

router.get('/check', cors({ exposedHeaders: 'Authorization' }), isAuth, handleErrorAsync((req, res, next) => UserControllers.check(req, res, next)));

// signup/signin
router.post('/signup', handleErrorAsync((req, res, next) => UserControllers.signup(req, res, next)));
router.post('/signin', cors({ exposedHeaders: 'Authorization' }), handleErrorAsync((req, res, next) => UserControllers.signin(req, res, next)));

// google 登入
router.get('/google', passport.authenticate('google', {scope: ['email', 'profile']}));
// google callback
router.get('/google/callback', passport.authenticate('google', {session: false}), handleErrorAsync((req, res, next) => UserControllers.googleSignIn(req, res, next)));
// callback
router.get('/TPcallback', cors({ exposedHeaders: 'Authorization' }), handleErrorAsync((req, res, next) => UserControllers.thirdPartyCallback(req, res, next)));

// profile
router.get('/profile', isAuth, handleErrorAsync((req, res, next) => UserControllers.profile(req, res, next)));
router.post('/updatePassword', isAuth, handleErrorAsync((req, res, next) => UserControllers.updatePassword(req, res, next)));
router.patch('/profile', isAuth, upload.array('photo', 1), handleErrorAsync((req, res, next) => UserControllers.updateProfile(req, res, next)));

// follow
router.get('/followingList', isAuth, handleErrorAsync((req, res, next) => UserControllers.getFollowingList(req, res, next)));
router.get('/:id/followersList', isAuth, handleErrorAsync((req, res, next) => UserControllers.getFollowersList(req, res, next)));
router.get('/:id/checkFollow', isAuth, handleErrorAsync((req, res, next) => UserControllers.checkFollow(req, res, next)));
router.post('/:id/follow', isAuth, handleErrorAsync((req, res, next) => UserControllers.follow(req, res, next)));
router.delete('/:id/unFollow', isAuth, handleErrorAsync((req, res, next) => UserControllers.unFollow(req, res, next)));

module.exports = router;
