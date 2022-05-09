const handles = {
  handleSuccess(res, data) {
    res.status(200).json({
      status: 'success',
      data: data
    })
  },
  appError(httpStatus, next, errMessage) {
    const errorStatusCode = {
      205: 'Reset Content',
      40001: '無對應資料',
      40002: '無此 ID',
      40003: errMessage,
      40004: '資料必須為物件',
      404: '無此要求'
    };
    const error = new Error(errorStatusCode[httpStatus]);
    if (httpStatus >= 40000 && httpStatus <= 49999) {
      httpStatus = 400;
    }
    error.statusCode = httpStatus;
    error.isOperational = true;
    next(error);
  }
}

module.exports = handles;