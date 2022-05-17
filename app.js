const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const HttpControllers = require('./controllers/http');
const resError = require('./service/resError');

// 伺服器出現重大錯誤時，也就是會吐出大量詳細資料時
process.on('uncaughtException', error => {
  console.error('Uncaught Exception!');
  if (process.env.NODE_ENV === 'dev') {
    console.error(error);
  }
  // 強制停止 process
  process.exit(1);
})

// 連線 mongodb
require('./connections');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');
const postsRouter = require('./routes/posts');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/posts', postsRouter);
app.use(HttpControllers.notFound);

// express 自訂錯誤處理
// 判斷何種環境，再提供錯誤
app.use(function(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  // develop
  if (process.env.NODE_ENV === 'dev') {
    return resError.develop(err, res);
  }
  // production
  if (err.name === 'ValidationError') {
    err.message = "資料欄位未填寫，請重新送出!";
    err.isOperational = true;
    return resError.production(err, res);
  }
  // 若非以上兩種情況，一律都使用線上環境提供錯誤
  resError.production(err, res);
})

// 若有未知情況的 catch
process.on('unhandled Rejection', (err, promise) => {
  console.error('Unhandled Rejection!');
  if (process.env.NODE_ENV === 'dev') {
    console.log('未知的 rejection:', promise, '原因:', err);
  }
})

module.exports = app;
