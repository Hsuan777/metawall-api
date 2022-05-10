const bcrypt = require('bcryptjs');
const validator = require('validator');
const {handleSuccess, appError} = require('../service/handles');
const User = require('../model/user');
const checkBody = require('../service/checkBody');
const { generateSendJWT } = require('../service/auth');

const user = {
  async signup(req, res, next) {
    const data = req.body;
    const isPass = checkBody('user', data, next);
    const emailExisted = await User.findOne({email:data.email});
    if (!isPass) return
    if (!validator.isLength(data.password, {min:8})) return appError(40003, next, '密碼需要大於 8 碼');
    if (data.password !== data.confirmPassword) return  appError(40003, next, '密碼不一致');
    if (!validator.isEmail(data.email)) return  appError(40003, next, '信箱格式錯誤');
    if (emailExisted) return appError(40003, next, '信箱已註冊');
    data.password = await bcrypt.hash(data.password, 12);
    const newUser = await User.create({
      ...data
    });
    generateSendJWT(201, res, newUser);
  },
  async signin(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return appError(40003, next, '帳密不可為空');
    }
    const user = await User.findOne({email}).select('+password');
    let auth;
    if (user) {
      auth = await bcrypt.compare(password, user.password);
      if (!auth) return appError(40003, next, '密碼不正確');
    } else {
      return appError(40003, next, '信箱不正確')
    }
    if (user && auth) generateSendJWT(200, res, user);
  },
  async profile(req, res, next) {
    handleSuccess(res, req.user) 
  },
  async updatePassword(req, res, next) {
    const data = req.body;
    if (data.password !== data.confirmPassword) {
      appError(40003, next, '密碼不一致');
    }
    const newPassword = await bcrypt.hash(data.password, 12);
    console.log(req.user.id);
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword
    });
    generateSendJWT(200, res, user);
  },
  
}

module.exports = user;