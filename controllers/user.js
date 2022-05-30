const bcrypt = require('bcryptjs');
const { handleSuccess, appError } = require('../service/handles');
const User = require('../model/userModel');
const Post = require('../model/postModel');
const { generateSendJWT } = require('../service/auth');
const roles = require('../service/roles');
const Imgur = require('../utils/imgur');
const axios = require('axios');

const user = {
  async signup(req, res, next) {
    const data = req.body;
    const emailExisted = await User.findOne({ email: data.email });
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
  async thirdPartySignup(req, res, next) {
    const data = {};
    const headersAuth = req.headers.authorization;
    let token;
    if (headersAuth && headersAuth.startsWith('Bearer')) {
      token = headersAuth.split(' ')[1];
    }
    switch (req.body.provider) {
      case 'google':
        await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`).then((res) => {
          if (res.data.email_verified) {
            data.name = res.data.given_name;
            data.email = res.data.email;
            data.avatar = res.data.picture;
            data.password = res.data.email
          }
        })
        break;
      default:
        break;
    }
    
    const emailExisted = await User.findOne({ email: data.email });
    if (!roles.checkEmail(data.email, emailExisted, next)) return
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
    const user = await User.findOne({ email }).select('+password');
    let auth;
    if (user) {
      auth = await bcrypt.compare(password, user.password);
      if (!auth) return appError(40003, next, '密碼不正確');
    } else {
      return appError(40003, next, '信箱不正確')
    }
    if (user && auth) generateSendJWT(200, res, user);
  },
  async thirdPartySignin(req, res, next) {
    const { provider } = req.body;
    if (!provider) {
      return appError(40003, next, '提供方不可為空');
    };
    const headersAuth = req.headers.authorization;
    let token;
    if (headersAuth && headersAuth.startsWith('Bearer')) {
      token = headersAuth.split(' ')[1];
    }
    let user;
    switch (req.body.provider) {
      case 'google':
        await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`).then(async (res) => {
          if (res.data.email_verified) {
            const email = res.data.email;
            user = await User.findOne({ email }).select('+password');
            if (!user) {
              return appError(40003, next, '找不到 google 使用者');
            }
          } else {
            return  appError(40003, next, '找不到 google 使用者');
          }
        }).catch(() => {
          appError(40003, next, 'Google 登入失敗');
        })
        break;
      default:
        break;
    }
    if (user) generateSendJWT(200, res, user);
  },
  async check(req, res, next) {
    if (!req.user) return appError(40003, next, '無此帳號，請聯繫管理員');
    res.send({
      status: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar,
      },
    });
  },
  async profile(req, res, next) {
    const user = await User.findById(req.user.id);
    res.send({
      status: true,
      data: user,
    });
  },
  async updateProfile(req, res, next) {
    const data = req.body;
    const userExisted = await User.findById(req.user.id);
    let userAvatar = '';
    if (!roles.checkName(data.name, next)) return
    if (!userExisted) return appError(40002, next);
    if (data.sex !== 'male' && data.sex !== 'female' && data.sex !== '') {
      return appError(40003, next, '請選擇性別或不公開');
    }
    if (req.files.length === 1) {
      userAvatar = await Imgur.upload(req.files, 107, 107);
      data.avatar = userAvatar[0].url;
    }
    const result = await User.findByIdAndUpdate(req.user.id, {
      ...data
    }, {new: true});
    handleSuccess(res, result)
  },
  async updatePassword(req, res, next) {
    const data = req.body;
    const userExisted = await User.findById(req.user.id);
    if (!roles.checkPassword(data.password, data.confirmPassword, next)) return
    if (!userExisted) return appError(40002, next);
    const newPassword = await bcrypt.hash(data.password, 12);
    const updateUser = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword
    });
    generateSendJWT(200, res, updateUser);
  },
  async getFollowList(req, res, next) {
    const list = await User.find({
      followers: { $in: [req.user.id] }
    }).populate({
      path:"user",
      select:"name _id avatar"
    });
    handleSuccess(res, list);
  },
  async follow(req, res, next) {
    if (req.params.id === req.user.id) {
      return next(appError(401,'自己無法使用追蹤功能',next));
    }
    // update 自己追蹤的
    await User.updateOne(
      // 查詢 自己的 id 且 追蹤的名單內無對方的 id
      {
        _id: req.user.id,
        'following.user': { $ne: req.params.id }
      },
      // 若沒有重複則加入
      {
        $addToSet: { following: { user: req.params.id } }
      }
    );
    // update 對方有誰追蹤他
    await User.updateOne(
      // 查詢 對方的 id 且 追蹤的名單內無自己的 id
      {
        _id: req.params.id,
        'followers.user': { $ne: req.user.id }
      },
      {
        $addToSet: { followers: { user: req.user.id } }
      }
    );
    handleSuccess(res, '已成功追蹤')
  },
  async unFollow(req, res, next) {
    if (req.params.id === req.user.id) {
      return next(appError(401,'自己無法使用追蹤功能',next));
    }
    await User.updateOne(
      {
        _id: req.user.id,
        'following.user': { $ne: req.params.id }
      },
      {
        $pull: { following: { user: req.params.id } }
      }
    );
    await User.updateOne(
      {
        _id: req.params.id,
        'followers.user': { $ne: req.user.id }
      },
      {
        $pull: { followers: { user: req.user.id } }
      }
    );
    handleSuccess(res, '已成功退追蹤')
  },
}

module.exports = user;