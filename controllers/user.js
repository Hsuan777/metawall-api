const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const User = require('../model/userModel');
const { handleSuccess, appError } = require('../service/handles');
const { generateSendJWT } = require('../service/auth');
const roles = require('../service/roles');
const Imgur = require('../utils/imgur');

let tempData = {};

const user = {
  async signup(req, res, next) {
    const data = req.body;
    const emailExisted = await User.findOne({ email: data.email });
    const userCount = await User.count();
    if (userCount >= 500) return appError(40003, next, '已達到註冊上限');
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
  async googleSignIn(req, res, next) {
    const data = {
      googleId: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.picture,
    };
    this.thirdPartySignin('google', data, res);
  },
  async thirdPartySignin(provider, data, res) {
    tempData = {};
    const webSiteCallbackUrl = 'http://localhost:3000/#/callback'
    const user = await User.findOne({ email: data.email });
    console.log(user);
    const onceToken = uuid.v4();
    const onceTokenHash = await bcrypt.hash(await onceToken, 12);
    tempData.onceToken = onceToken;
    // 信箱已存在 且 已使用第三方登入
    if (user && user[`${provider}Id`]) {
      tempData.user = user;
      res.redirect(webSiteCallbackUrl + `?token=${onceTokenHash}`);
    } else if (user && user[`${provider}Id`] === undefined) {
      //  信箱已存在 且 未使用第三方登入
      user[`${provider}Id`] = data[`${provider}Id`];
      tempData.user = user;
      res.redirect(webSiteCallbackUrl + `?onceToken=${onceTokenHash}`);
    } else {
      // 信箱不存在 且 使用第三方登入
      // 檢查使用者是否已達限制數量
      const userCount = await User.count();
      if (userCount >= 500) return appError(40003, next, '已達到註冊上限');
      
      // 第三方登入無須密碼，但 user model 需要
      const signUpData = {...data};
      const new_uuid = await uuid.v4();
      signUpData.password = await bcrypt.hash(new_uuid, 12);
      const newUser = await User.create({
        ...signUpData
      });
      tempData.user = newUser;
      res.redirect(webSiteCallbackUrl + `?onceToken=${onceTokenHash}`);
    }
  },
  async thirdPartyCallback(req, res, next) {
    // query.onceToken is Hash
    const authOnceToken = await bcrypt.compare(tempData.onceToken, req.query.onceToken);
    if (authOnceToken) generateSendJWT(200, res, tempData.user);
    else appError(40003, next, '驗證失敗');
    tempData = {};
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
    handleSuccess(res, user)
  },
  async updateProfile(req, res, next) {
    const data = req.body;
    let userAvatar = '';
    if (!roles.checkBody('userProfile', data, next)) return
    if (!roles.checkName(data.name, next)) return
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
    if (!roles.checkBody('userPassword', data, next)) return
    if (!roles.checkPassword(data.password, data.confirmPassword, next)) return
    const newPassword = await bcrypt.hash(data.password, 12);
    const updateUser = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword
    });
    generateSendJWT(200, res, updateUser);
  },
  async getFollowingList(req, res, next) {
    // 尋找 followers 欄位內，包含已登入 user 的 id
    const followList = [];
    const user = await User.findOne({_id: req.user._id}, {following: 1});
    for (let item of user.following) {
      const data = await User.findOne({_id: item.user._id}, {name: 1, avatar: 1});
      data.createdAt = item.createdAt;
      followList.push(data)
    }
    handleSuccess(res, followList);
  },
  async getFollowersList(req, res, next) {
    // 尋找 followers 欄位內，包含已登入 user 的 id
    const followList = [];
    const user = await User.findOne({_id: req.params.id}, {followers: 1});
    for (let item of user.followers) {
      const data = await User.findOne({_id: item.user._id}, {name: 1, avatar: 1});
      data.createdAt = item.createdAt;
      followList.push(data)
    }
    handleSuccess(res, followList);
  },
  async follow(req, res, next) {
    if (req.params.id === req.user.id) {
      return appError(40003, next, '自己無法使用追蹤功能');
    }
    // update 自己追蹤的
    const updateFollowingResult = await User.updateOne(
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
    const updateFollowersResult = await User.updateOne(
      // 查詢 對方的 id 且 追蹤的名單內無自己的 id
      {
        _id: req.params.id,
        'followers.user': { $ne: req.user.id }
      },
      {
        $addToSet: { followers: { user: req.user.id } }
      }
    );
    if (updateFollowingResult.modifiedCount && updateFollowersResult.modifiedCount) {
      handleSuccess(res, '已成功追蹤')
    } else {
      return appError(40003, next, '已追蹤');
    }
  },
  async unFollow(req, res, next) {
    if (req.params.id === req.user.id) {
      return appError(40003, next, '自己無法使用追蹤功能');
    }
    const updateFollowingResult = await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        $pull: { following: { user: req.params.id } }
      }
    );
    const updateFollowersResult = await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $pull: { followers: { user: req.user.id } }
      }
    );
    if (updateFollowingResult.modifiedCount && updateFollowersResult.modifiedCount) {
      handleSuccess(res, '已成功退追蹤');
    } else {
      return appError(40003, next, '未追蹤');
    }
  },
  async checkFollow(req, res, next) {
    const findFollowingResult = await User.findOne(
      // 查詢 自己的 id 且 追蹤的名單是否有對方的 id
      {
        _id: req.user.id,
        'following.user': { $in: req.params.id }
      },
    );
    if (!findFollowingResult) handleSuccess(res, '未追蹤');
    else handleSuccess(res, '已追蹤')
  }
}

module.exports = user;