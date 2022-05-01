const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const HttpControllers = require('./controllers/http');
// 連線 mongodb
require('./connections');

const indexRouter = require('./routes/index');
const signupRouter = require('./routes/signup');
const usersRouter = require('./routes/user');
const postsRouter = require('./routes/posts');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/signup', signupRouter);
app.use('/user', usersRouter);
app.use('/posts', postsRouter);
app.use(HttpControllers.notFound);

module.exports = app;
