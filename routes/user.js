var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const UserControllers = require('../controllers/user');
const HttpControllers = require('../controllers/http');
const User = require('../model/user');
const handleErrorAsync = require("../service/handleErrorAsync");
const { appError } = require('../service/handles');
const { findById } = require('../model/user');

const isAuth = handleErrorAsync(async (req, res, next) => {
  // 確認 token 是否存在
  let token;
  const headersAuth = req.headers.authorization;
  if (headersAuth && headersAuth.startsWith('Bearer')) {
    token = headersAuth.split(' ')[1];
  }
  if (!token) appError(401, next);
  // 驗證 token
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) reject(err);
      else resolve(payload); // 會回傳物件資料
    })
  })
  const currentUser = await User.findById(decoded.id);
  req.user = currentUser;
  next();
});

router.post('/signup', handleErrorAsync((req, res, next) => UserControllers.signup(req, res, next)));
router.post('/signin', handleErrorAsync((req, res, next) => UserControllers.signin(req, res, next)));
router.get('/profile', isAuth, handleErrorAsync((req, res, next) => UserControllers.profile(req, res, next)));

router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
