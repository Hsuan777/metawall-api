const headers = require('./headers');

const handles = {
  handleSuccess(res, data) {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      status: 'success',
      data: data
    }));
    res.end();
  },
  handleError(res, status, detailCode , message, next) {
    const errorStatusCode = {
      205: 'Reset Content',
      400: {
        40001: '無對應資料',
        40002: message,
        40003: '無此 ID'
      },
      404: '無此要求'
    };
    const outputMessage = errorStatusCode[status][detailCode] || errorStatusCode[status];
    res.writeHead(status, headers);
    res.write(JSON.stringify({
      status: 'error',
      message: outputMessage
    }));
    res.end();
  },
  appError(httpStatus, errMessage, next) {
    const error = new Error(errMessage);
    error.statusCode = httpStatus;
    error.isOperational = true;
    next(error);
  }
}

module.exports = handles;