const {handleSuccess, handleError} = require('../service/handles');
const User = require('../model/user');
const checkBody = require('../service/checkBody');

const user = {
  async addUser(req, res) {
    const data = req.body;
    const isPass = checkBody(res, 'user', data);
    if (isPass) {
      try {
        const newUser = await User.create({
          ...data
        });
        handleSuccess(res, newUser);
      } catch (error) {
        handleError(res, 400, 40002, error.message)
      }
    }
  },
}

module.exports = user;