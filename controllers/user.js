const bcrypt = require('bcryptjs');
const validator = require('validator');
const {handleSuccess, appError} = require('../service/handles');
const User = require('../model/user');
const checkBody = require('../service/checkBody');

const user = {
  async addUser(req, res, next) {
    const data = req.body;
    const isPass = checkBody('user', data, next);
    if (!validator.isLength(data.password, {min:8})) appError(40003, next, '密碼需要大於 8 碼');
    if (!validator.isEmail(data.email)) appError(40003, next, '信箱格式錯誤');
    bcrypt.hash(data.password, 12).then((hashString) => {
      bcrypt.compare(data.password, hashString, async (err, ans) => {
        if (ans && isPass) {
          const newUser = await User.create({
            ...data
          });
          handleSuccess(res, newUser);
        } else {
          appError(40003, next, '密碼不同，請再確認一次。');
        }
      })
    })
  },
}

module.exports = user;