const resError = {
  // 產品環境
  production(err, res) {
    // 若為可預知的錯誤 isOperational 為 true
    if (err.isOperational) {
      res.status(err.statusCode).json({
        message: err.message
      })
    } else {
      // console.error('出現重大錯誤', err);
      rea.status(500).json({
        status:'error',
        message: "系統錯誤，請洽系統管理員。"
      })
    }
  },
  // 開發中環境
  develop(err, res) {
    res.status(err.statusCode).json({
      message: err.message,
      error: err,
      stack: err.stack
    })
  }
};

module.exports = resError;