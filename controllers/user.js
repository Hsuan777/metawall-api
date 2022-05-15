const bcrypt = require('bcryptjs');
const {handleSuccess, appError} = require('../service/handles');
const User = require('../model/userModel');
const { generateSendJWT } = require('../service/auth');
const roles = require('../service/roles');

const user = {
  async signup(req, res, next) {
    const data = req.body;
    const emailExisted = await User.findOne({email: data.email});
    if (!roles.checkBody('user', data, next)) return
    if (!roles.checkName(data.name, next)) return
    if (!roles.checkEmail(data.email, emailExisted, next)) return
    if (!roles.checkPassword(data.password, data.confirmPassword, next)) return
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
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword
    });
    generateSendJWT(200, res, user);
  },
  
}

module.exports = user;