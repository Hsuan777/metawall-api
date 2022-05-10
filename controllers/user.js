const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const {handleSuccess, appError} = require('../service/handles');
const User = require('../model/user');
const checkBody = require('../service/checkBody');

// jwt
const generateSendJWT = (res, user) => {
  // 產生 token，需要 payload、JWT_SECRET，額外加上 JWT_EXPIRES_DAY
  const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY
  });
  user.password = undefined;
  const data = {
    user: {
      token,
      name: user.name
    }
  }
  handleSuccess(res, data)  
}

const user = {
  async signup(req, res, next) {
    const data = req.body;
    const isPass = checkBody('user', data, next);
    if (!validator.isLength(data.password, {min:8})) appError(40003, next, '密碼需要大於 8 碼');
    if (!validator.isEmail(data.email)) appError(40003, next, '信箱格式錯誤');
    bcrypt.hash(data.password, 12).then((hashString) => {
      bcrypt.compare(data.confirmPassword, hashString, async (err, ans) => {
        if (ans && isPass) {
          data.password = hashString;
          const newUser = await User.create({
            ...data
          });
          handleSuccess(res, newUser);
        } else {
          appError(40003, next, '密碼不一致');
        }
      })
    })
  },
  async signin(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      appError(40003, next, '帳密不可為空');
    }
    const user = await User.findOne({email}).select('+password');
    let auth;
    if (user) {
      auth = await bcrypt.compare(password, user.password);
      if (!auth) appError(40003, next, '密碼不正確');
    } else {
      appError(40003, next, '信箱不正確')
    }
    if (user && auth)  generateSendJWT(res, user);
  },
  async profile(req, res, next) {
    handleSuccess(res, req.user) 
  }
}

module.exports = user;