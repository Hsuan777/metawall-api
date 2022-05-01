const {handleSuccess, handleError} = require('../service/handles');
const http = {
  cors(req, res) {
    handleSuccess(res, 'CORS Message');
  },
  notFound(req, res) {
    handleError(res, 404)
  }
}

module.exports = http;