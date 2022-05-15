const jwt = require('jsonwebtoken');
const { appError } = require('../service/handles');
const handleErrorAsync = require('../service/handleErrorAsync');
const User = require('../model/userModel');

const isAuth = handleErrorAsync(async (req, res, next) => {
  // 確認 token 是否存在
  let token;
  const headersAuth = req.headers.authorization;
  if (headersAuth && headersAuth.startsWith('Bearer')) {
    token = headersAuth.split(' ')[1];
  }
  if (!token) return appError(401, next);
  // 驗證 token
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) reject(appError(40003, next, '未登入，請重新登入'));
      else resolve(payload); // 會回傳物件資料
    })
  })
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return appError(40001, next)
  req.user = currentUser;
  next();
});

// jwt
const generateSendJWT = (statusCode, res, user) => {
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
  res.status(statusCode).json({
    status: 'success',
    data: data
  })  
}

module.exports = {
  isAuth,
  generateSendJWT
}